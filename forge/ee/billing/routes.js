/**
 *
 */
const { Readable } = require('stream')

module.exports = async function (app) {
    const stripe = require('stripe')(app.config.billing.stripe.key)

    /**
     * Need to work out what auth needs to have happend
     */
    app.addHook('preHandler', async (request, response) => {
        if (request.params.teamId) {
            console.log('preHandler teamId', request.params.teamId)
            request.team = await app.db.models.Team.byId(request.params.teamId)
        }
    })

    /**
     */
    app.post('/callback',
        {
            preParsing: function (request, reply, payload, done) {
                const chunks = []
                payload.on('data', chunk => {
                    chunks.push(chunk)
                })
                payload.on('end', () => {
                    const raw = Buffer.concat(chunks)
                    request.rawBody = raw
                    done(null, Readable.from(raw))
                })
            },
            schema: {
                body: {
                    type: 'object',
                    required: ['type', 'data'],
                    properties: {
                        type: { type: 'string' },
                        data: { type: 'object' }
                    }
                }
            }
        },
        async (request, response) => {
            const sig = request.headers['stripe-signature']
            let event = request.body
            if (app.config.billing?.stripe?.wh_secret) {
                try {
                    event = stripe.webhooks.constructEvent(request.rawBody, sig, app.config.billing.stripe.wh_secret)
                } catch (err) {
                    console.log(err)
                    response.code(400).type('text/hml').send('Failed Signature')
                    return
                }
            }

            const customer = event.data.object.customer
            const subscription = event.data.object.subscription
            const teamId = event.data.object?.client_reference_id
            let team = {}
            if (teamId) {
                team = await app.db.models.Team.byId(teamId)
            }

            switch (event.type) {
            case 'checkout.session.completed':
                console.log(event)
                app.db.controllers.Subscription.createSubscription(team, subscription, customer)
                break
            case 'checkout.session.expired':
                // should remove the team here
                break
            case 'customer.subscription.created':

                break
            case 'customer.subscription.updated':

                break
            case 'customer.subscription.deleted':

                break
            case 'charge.failed':

                break
            }

            response.code(200).send()
        }
    )

    /**
     */
    app.get('/customer-portal/:teamId', async (request, response) => {
        const team = request.team
        const portal = await stripe.billingPortal.sessions.create({
            customer: '',
            return_url: `${app.config.base_url}/team/${team.slug}/overview`
        })

        response.redirect(303, portal.url)
    })

    // app.get('/teams/:teamId', async (request, response) => {
    //     const team = request.team
    // })
}