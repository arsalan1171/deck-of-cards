import axios from 'axios';

let deck_id = '';
const getShuffledDeck = async () => {
    let response = await axios.get(`https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`);
    deck_id = response.data.deck_id;
    return response.data;
}

const drawAcard = async () => {
    let response = await axios.get(`https://www.deckofcardsapi.com/api/deck/` + deck_id + `/draw/?count=1`);
    return response.data;
}

const cardsApi = {
    getShuffledDeck,drawAcard
};

export default cardsApi;