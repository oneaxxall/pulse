# 🚀 Installation

{% hint style="info" %}
The Network Watcher is only used when deploying Socket via Kubernetes.
{% endhint %}

If you run Socket standalone in a cluster at scale, you may run into capacity issues. For example, RAM usage might be near the limit supported by your server and even if you decide to horizontally scale the servers, new connections might still come to servers that are near their memory limit.

Running the Socket Network Watcher inside the same pod will solve these issues by continuously monitoring the Socket Server Usage API, labeling the pods that get over a specified threshold with `ws.Socket.app/accepts-new-connections: "no"`, so that the services watching for the pods will ignore them.

The Network Watcher source code is available on GitHub ([Socket/network-watcher](https://github.com/Socket/network-watcher)).

### Docker Container

The Network Watcher is available as a Docker container. It can either be installed manually by adding a container in your pods that also run Socket, or you can use the [Socket/Socket Helm Chart](https://github.com/Socket/charts/tree/master/charts/Socket), which includes an already-set Network Watcher container you can easily turn on and off.

When a new Network Watcher release is created on GitHub, a Docker image with the same tag is automatically pushed to the [Socket/network-watcher](https://hub.docker.com/r/Socket/network-watcher) registry where you may view the available tags.

### Helm Chart

To deploy using Helm, please consult the documentation [the Socket Helm chart GitHub repository](https://github.com/Socket/charts/tree/master/charts/Socket).

### Kubernetes YAML

The following configuration example demonstrates how you may configure the Network Watcher container in your pods that run Socket.

{% tabs %}
{% tab title="Service" %}
```yaml
apiVersion: v1
kind: Service
metadata:
  name: Socket-service
spec:
  selector:
    app: Socket
    ws.Socket.app/accepts-new-connections: "yes" # required
  ports:
    - protocol: TCP
      port: 6001
      targetPort: 6001
      name: ws
```
{% endtab %}

{% tab title="Deployment" %}
```yaml
ap

iVersion: apps/v1
kind: Deployment
metadata:
  name: Socket
  labels:
    app: Socket
spec:
  replicas: 3
  selector:
    matchLabels:
      app: Socket
  template:
    metadata:
      labels:
        app: Socket
        ws.Socket.app/accepts-new-connections: "yes" # optional
    spec:
      containers:
        - name: Socket
          image: Socket/Socket:0.17-16-alpine
          ports:
            - containerPort: 6001
        - name: network-watcher
          image: quay.io/Socket/network-watcher:6
          env:
            - name: KUBE_CONNECTION
              value: cluster
            - name: MEMORY_PERCENT
              value: "75" # if > 75% memory, reject new connections
            - name: CHECKING_INTERVAL
              value: "5" # every 5 seconds
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
          
```
{% endtab %}
{% endtabs %}
