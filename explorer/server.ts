import express, { Request, Response } from 'express';

const app = express();
const PORT = 3001;

app.use(express.json());

interface RegistryState {
  [rootHash: string]: any;
}

let registryState: RegistryState = {};

app.post('/store', (req: Request, res: Response) => {
    const { rootHash, state } = req.body;
    registryState[rootHash] = state;
    res.status(200).send({ message: 'State stored successfully' });
});

app.get('/state/:rootHash', (req: Request, res: Response) => {
    const { rootHash } = req.params;
    const state = registryState[rootHash];
    if (state) {
        res.status(200).json(state);
    } else {
        res.status(404).send({ message: 'State not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
