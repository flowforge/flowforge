# Kubernetes Install

This version of the FlowForge platform is intended for running in the Kubernetes Container management system. Typically suited for large on permise deployments or deployment in Cloud infrastucture.

### Prerequisites

#### Kubernetes

You will need a Kubernetes environment. The deployment has currently been tested on the following environments:

 - AWS EKS
 - MicroK8s

 It should run on any Kubernetes platform, but may require some changes for vendor specific Ingress setup.

#### Helm

FlowForge uses a Helm Chart to manage deployment

#### Docker Container Registry

FlowForge on Kubernetes will require a Docker Container Registry to host the both the core platform container and the containers that back any Stacks you wish to deploy.

### PostgreSQL Database 

The Helm chart can either install a dedicated PostgreSQL database into the same K8s cluster or can configure the install to use an external instance.

#### DNS

A wildcard DNS entry will be needed to point to the domain that is used fro the project instances. This will need to point to the K8s Ingress controller.

#### Email

Some features require the ability to send email to users. This can be currently be provided by:

- Details of a SMTP server
- AWS SES

### Installing FlowForge

#### Download

Download the helm project from GitHub here:

https://github.com/flowforge/helm/

#### Building Containers

At a minimum there are 2 container required.

 - flowforge/forge-k8s
 - flowforge/node-red

These can be built usinth the `./build-containers.sh` script in the root of the `helm` project. This script takes the hostname of the Docker Container Registry as it's only argument. This will be pre-pended to the constainer names. e.g.

```
./build-containers.sh containers.example.com
```

This will build and publish

- containers.example.com/flowforge/forge-k8s
- containers.example.com/flowforge/node-red

##### flowforge/forge-k8s

This container includes the FlowForge App and the Kubernetes Drivers

##### flowforge/node-red

This is a basic Node-RED image with the FlowForge Launcher and the required Node-RED plugins to talk to the FlowForge Platform. This is the basis for the initial Stack.

This is the container you can customise for your deployment.


### Configure FlowForge

All the initial configuration is handled by the Helm chart. This is done by creating a `values.yml` file in the `helm` directory that will be passed to the helm along with the chart.

This is the minimal configuration

```yaml
forge:
  entryPoint: forge.example.com
  domain: example.com
  https: false
  registry: containers.example.com
  registrySecret: password
  localPostgresql: true
```

When running on AWS EKS and using AWS SES for email (The IAMRole needs to have the required permissions to use SES) it would look something like:

```yaml
forge:
  entryPoint: forge.example.com
  domain: example.com
  registry: <aws-account-id>.dkr.ecr.eu-west-1.amazonaws.com
  cloudProvider: aws
  aws:
    IAMRole: arn:aws:iam::<aws-account-id>:role/flowforge_service_account_role
  email:
    ses:
      region: eu-west-1
```

TODO: *Detailed walk through for AWS in internal Cloud Project docs. Will add extra page with sanitised version* [AWS setup notes](aws.md)

A full list of all the configable values can be found in the Helm Chart README.md [here](https://github.com/flowforge/helm/blob/main/helm/flowforge/README.md)


```
helm install flowforge flowforge -f values.yml
```

### Running FlowForge

### First Run Setup

The first time you access the platform in your browser, it will take you through
creating an administrator for the platform and other configuration options.

For more information, follow [this guide](../first-run.md).
