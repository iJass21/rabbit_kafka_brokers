const amqp = require('amqplib');

const rabbitMQ_settings = {
    protocol: 'amqp',
    hostname: 'rabbitmq',
    port: 5672,
    username: 'guest',
    password: 'guest',
    authMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL']
}

let average = 0;
let count = 0;

let max_latency = 0;

connect();

async function connect() {
    try {
        const connection = await amqp.connect(rabbitMQ_settings);
        console.log('Conectado a RabbitMQ');

        // Crear un canal
        const channel = await connection.createChannel();
        console.log('Canal creado');

        // Crear una cola
        const queue = 'queue' + process.argv[2];
        await channel.assertQueue(queue, { durable: false });
        
        console.log('[*] Esperando mensajes en "%s".', queue);
        channel.consume(queue, function(msg) {
            sendTimeStamp = JSON.parse(msg.content.toString()).timestamp;
            latency = Date.now() - sendTimeStamp;

            average = (average * count + latency) / (count + 1)
            if (latency > max_latency) max_latency = latency;
            
            console.log(" [x] Mensaje recibido: %s", msg.content.toString(), 'Latencia: ', latency);

            count++;
        });
        
    } catch (error) {
        console.log(error);
    }
}

// Mostrar estadisticas al usar CTRL-C
process.on('SIGINT', function() {
    console.log("\nMensajes recibidos: " + count);
    console.log("\nLatencia promedio: " + average);
    console.log("Latencia maxima: " + max_latency)

    process.exit();
});