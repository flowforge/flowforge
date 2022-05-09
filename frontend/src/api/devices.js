import client from './client'
import paginateUrl from '@/utils/paginateUrl'

const getDevices = async (cursor, limit) => {
    const url = paginateUrl('/api/v1/devices', cursor, limit)
    return client.get(url).then(res => {
        return res.data
    })
}

const create = async (options) => {
    return client.post('/api/v1/devices/', options).then(res => {
        return res.data
    })
}
const deleteDevice = async (deviceId) => {
    return await client.delete(`/api/v1/devices/${deviceId}`)
}
const getDevice = async (deviceId) => {
    return await client.get(`/api/v1/devices/${deviceId}`).then(res => {
        return res.data
    })
}
const updateDevice = async (deviceId, options) => {
    return client.put(`/api/v1/devices/${deviceId}`, options).then(res => {
        return res.data
    })
}

const generateCredentials = async (deviceId) => {
    return client.post(`/api/v1/devices/${deviceId}/generate_credentials`).then(res => {
        return res.data
    })
}

export default {
    create,
    getDevice,
    deleteDevice,
    getDevices,
    updateDevice,
    generateCredentials
}
