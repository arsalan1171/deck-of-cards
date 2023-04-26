import axios from 'axios';
const getShuffledDeck = async () => {
    let response = await axios.get(`https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`);
    return response.data;
}

const drawAcard = async () => {
    let response = await axios.get(`https://www.deckofcardsapi.com/api/deck/z1vw6kzrd4m2/draw/?count=1`);
    return response.data;
}

const cardsApi = {
    getShuffledDeck,drawAcard
};

export default cardsApi;