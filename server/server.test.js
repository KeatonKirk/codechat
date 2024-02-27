import supertest from 'supertest';
import {jest} from '@jest/globals'
//import app from '../server/server.js'; // Adjust the import to point to where your express app is defined

jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    on: jest.fn(),
    connect: jest.fn(),
    set: jest.fn()
  }),
}));

jest.unstable_mockModule('./codeOps.mjs', async () => ({
    getCode: jest.fn().mockResolvedValue({
        dir: {
            file: 'test',
            dir2: {
                file: 'hello'
            }
        }
    })
}))

jest.unstable_mockModule('./agentOps.mjs', async () => ({
    setUpAgent: jest.fn().mockResolvedValue({
        "id": "asst_abc123",
        "object": "assistant",
        "created_at": 1698984975,
        "name": "Math Tutor",
        "description": null,
        "model": "gpt-4",
        "instructions": "You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
        "tools": [
          {
            "type": "code_interpreter"
          }
        ],
        "file_ids": [],
        "metadata": {}
      }
      ),
      listMessages: jest.fn().mockResolvedValue([
          {
            "id": "msg_abc123",
            "object": "thread.message",
            "created_at": 1699016383,
            "thread_id": "thread_abc123",
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": {
                  "value": "How does AI work? Explain it in simple terms.",
                  "annotations": []
                }
              }
            ],
            "file_ids": [],
            "assistant_id": null,
            "run_id": null,
            "metadata": {}
          },
          {
            "id": "msg_abc456",
            "object": "thread.message",
            "created_at": 1699016383,
            "thread_id": "thread_abc123",
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": {
                  "value": "Hello, what is AI?",
                  "annotations": []
                }
              }
            ],
            "file_ids": [
              "file-abc123"
            ],
            "assistant_id": null,
            "run_id": null,
            "metadata": {}
          }
        ]),
      createThread: jest.fn().mockResolvedValue({
        "id": "thread_abc123",
        "object": "thread",
        "created_at": 1699012949,
        "metadata": {}
      }
      ),
      addMessage: jest.fn().mockResolvedValue([
        {
          "id": "msg_abc123",
          "object": "thread.message",
          "created_at": 1699016383,
          "thread_id": "thread_abc123",
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": {
                "value": "How does AI work? Explain it in simple terms.",
                "annotations": []
              }
            }
          ],
          "file_ids": [],
          "assistant_id": null,
          "run_id": null,
          "metadata": {}
        },
        {
          "id": "msg_abc456",
          "object": "thread.message",
          "created_at": 1699016383,
          "thread_id": "thread_abc123",
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": {
                "value": "Hello, what is AI?",
                "annotations": []
              }
            }
          ],
          "file_ids": [
            "file-abc123"
          ],
          "assistant_id": null,
          "run_id": null,
          "metadata": {}
        }
      ])
}))

const {getCode} = await import('./codeOps.mjs');

const {setUpAgent, listMessages, createThread, addMessage} = await import('./agentOps.mjs')

describe('POST /create-session', () => {
    it('should return 200 and a session object for valid request', async () => {
      const app = await import('./server.mjs')
      console.log('got past import')
      const requestBody = {
        url: 'valid url representing the repository',
      };
  
      const response = await supertest(app.default)
        .post('/create-session')
        .send(requestBody);
      //console.log('response in test:', response)
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(response.body).toHaveProperty('url');
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

describe('testing test', () => {
    it('should just pass a test.', () => {
        console.log('just testing')
        const response = 'nice'
    
        expect(response).toBe('nice')
    })
})