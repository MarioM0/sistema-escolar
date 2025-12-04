const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'API funcionando' });
});

module.exports = router;
