module.exports = {
    name: 'pileface',
    description: 'Lance une pièce !',
    execute(message, args) {
        const randomIndex = Math.floor(Math.random() * 2);
        let reponse = '';

        if (randomIndex === 1) {
            reponse = 'Pile !';
        } else {
            reponse = 'Face !';
        }

        message.channel.send('*La pièce est en l\'air...*')
            .then(msg => {
                msg.edit({
                    content: reponse,
                })
            })
            .catch(console.error);
    },
};