const express= require('express');
const router=express.Router();


const sitecontroler=require('../controler/sitecontroler');

const localData=require('../middleware/loadCommonData');
router.use(localData);
router.get('/',sitecontroler.index);
router.get('/category/:name',sitecontroler.articlesByCategory);
router.get('/single/:id', sitecontroler.singleArticle);
router.get('/search',sitecontroler.search);
router.get('/author/:name',sitecontroler.author);
router.post('/single/:id/comment',sitecontroler.addComment);
module.exports=router;
