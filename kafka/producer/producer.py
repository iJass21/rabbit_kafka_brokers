from kafka import KafkaProducer
from json import dumps
from datetime import datetime
import random
import string
import time
import sys

device_id: int = sys.argv[2]

time_delta: int = 1.0/int(sys.argv[3])
servidores_bootstrap = 'kafka:9092'
topic = 'mi_tema' + sys.argv[1]

productor = KafkaProducer(bootstrap_servers=[servidores_bootstrap])

count: int = 0

try:
    while(True):
        timestamp: datetime = datetime.now()
        message_size: int = random.randint(2, 30)
        new_message: str = "".join(random.choices(string.ascii_lowercase + string.digits, k=message_size))

        data = {
            'id': device_id,
            'data': {
                'timestamp': str(timestamp),
                'value': {
                    'data': new_message
                }
            }
        }

        productor.send(topic, dumps(data).encode())
        print(f'Enviando: {data["data"]}')
        time.sleep(time_delta)
        count += 1

except KeyboardInterrupt:
    print(f"\nMensajes enviados: {count}")
