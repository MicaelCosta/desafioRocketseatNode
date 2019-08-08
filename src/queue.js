import 'dotenv/config';

// Criado este arquivo, para processar a Queue em um core diferente da aplicação
// Com isso a fila, nunca irá influenciar na perfomance da aplicação
import Queue from './lib/Queue';

Queue.processQueue();
