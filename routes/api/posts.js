const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Profile Model
const Profile = require('../../models/Profile');
// Load User module
const Post = require('../../models/Post');

// Load User module
const User = require('../../models/User');

//Load Validation
const validatePostInput = require('../../validation/post')

//@route GET api/posts/test
//@desc  Tests post route
//@acces Public
router.get('/test', (req,res) => res.json({
    msg: 'Posts works'
}));

//@route POST api/posts
//@desc  create post
//@acces private
router.post('/',passport.authenticate('jwt',{session: false}), 
(req,res) => {
    const {errors,isValid} = validatePostInput(req.body)
    if(!isValid){
        return res.status(400).json(errors);
    }
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });
    newPost.save().then(post => res.json(post));
});

//@route GET api/posts
//@desc  GET post
//@acces public
router.get('/', 
(req,res) => {
    Post.find()
    .sort({date: -1})
    .then(post =>res.json(post))
    .catch(err => res.status(404).json(err));
});

//@route GET api/posts/:id
//@desc  GET post
//@acces public
router.get('/:id', 
(req,res) => {
    Post.findById(req.params.id)
    .then(post => {
        if(!post){
            return res.status(404).json({msge: 'No psot ith this ID'});
        }
        res.json(post);
    })
    .catch(err => res.status(404).json(err));
});

//@route DELETE api/posts/:id
//@desc  Delete post
//@acces private
router.delete('/:id', passport.authenticate('jwt',{session: false}),
(req,res) => {
    Profile.findOne({user: req.user.id})
    .then(profile =>{
        Post.findById(req.params.id)
        .then(post => {
            if(post.user.ToString() !== req.user.id){
                return res.status(401).json({notauthorized: 'User not authorized'});
            }

            post.remove().then(() => res.json({succes: true}))
            
        })
        .catch(err => res.status(404).json(err));
    })
   
});

//@route POST api/posts/like/:id
//@desc  Like post
//@acces private
router.post('/like/:id', passport.authenticate('jwt',{session: false}),
(req,res) => {
    Profile.findOne({user: req.user.id})
    .then(profile =>{
        Post.findById(req.params.id)
        .then(post => {
          if(
              post.likes.filter(like => like.user.toString() === req.user.id).length > 0
            ){
              return res.status(400).json({alreadylike: 'User already like this post'})
          }      
          
          //add user id to array of likes
          post.likes.unshift({user: req.user.id});

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json(err));
    })   
});
//@route POST api/posts/unlike/:id
//@desc  UnLike post
//@acces private
router.post('/unlike/:id', passport.authenticate('jwt',{session: false}),
(req,res) => {
    Profile.findOne({user: req.user.id})
    .then(profile =>{
        Post.findById(req.params.id)
        .then(post => {
          if(
              post.likes.filter(like => like.user.toString() === req.user.id).length === 0
            ){
              return res.status(400).json({ notliked: 'you have not yet liked this post'})
          }      
          
          //add user id to array of likes
          const removeIndex = post.likes.map(item => item.user.toString())
          .indexOf(req.user.id);

          post.likes.splice(removeIndex,1);

          post.save().then(post => res.json(post));

        })
        .catch(err => res.status(404).json(err));
    })   
});

//@route POST api/posts/comment/:id
//@desc   Add comment post
//@acces private
router.post('/comment/:id', passport.authenticate('jwt',{session: false}),
(req,res) => {
    const {errors,isValid} = validatePostInput(req.body)
    if(!isValid){
        return res.status(400).json(errors);
    }
        Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            }

            post.comments.unshift(newComment);

            post.save().then(post=> res.json(post));
        })
        .catch(err => res.status(404).json(err));
});

//@route Delete api/posts/comment/:id/:comment_id
//@desc   Remove comment from post
//@acces private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt',{session: false}),
(req,res) => {
        Post.findById(req.params.id)
        .then(post => {
            if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0){
                return res.status(404).json({commentnotexists: 'comment does not exist'});
            }

            const removeIndex = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id);

            post.comments.splice(removeIndex,1);

            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json(err));
});
module.exports = router;