const amqp = require('amqplib');

const rabbitMQ_settings = {
    protocol: 'amqp',
    hostname: 'rabbitmq',
    port: 5672,
    username: 'guest',
    password: 'guest',
    authMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL']
}

const  generateRandomString = (num) => {
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result1= ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < num; i++ ) {
        result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result1;
}

// Recuperando datos de terminal

let data = {
    device : process.argv[3],
    channel: process.argv[2],    
}

messagePerSecond = process.argv[4];
miliSecond = ((1000/messagePerSecond));

connect();

async function sendMessage (channel) {
    // Construccion mensaje 
    data.timestamp = Date.now();
    data.data = generateRandomString(Math.floor(Math.random()*30)+1);
    const msg = JSON.stringify(data); // Mensaje a enviar

    // Crear una cola
    const queue = 'queue' + data.channel;
    await channel.assertQueue(queue, { durable: false });

    await channel.sendToQueue(queue, Buffer.from(msg)); // Envia el mensaje
    console.log('Dispositivo: ' + data.device + ' enviando: {timestamp: ' + data.timestamp + ', value: {"data": "' + data.data + '"}}');

    setTimeout(() => {sendMessage(channel)}, miliSecond);
}

async function connect() {    
    try {
        const connection = await amqp.connect(rabbitMQ_settings);
        console.log('Conectado a RabbitMQ');

        // Crear canal
        const channel = await connection.createChannel();
        console.log('Canal creado');

        sendMessage(channel);
        
    } catch (error) {
        console.log(error);
    }
}