import express from 'express';
import User from '../models/User.js';
import Meme from '../models/Meme.js';

const router = express.Router();

//implementing user routing
router.get('/', async (req,res) =>{
    try{
        const users = await User.find();
        res.json(users);
    }catch(err){
        res.json({message:err});
    }
})

router.post('/', async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      const existingUser = await User.findOne({
        $or: [{ username: username }, { email: email }],
      });
  
      if (existingUser) {
        return res
          .status(400)
          .json({ message: 'Username or email already exists' });
      }
  
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message:
            'Password should be at least 8 characters long and contain at least one letter, one number, and one special character (@ $ ! % * # ? &)',
        });
        }
  
      const user = new User({
        username: username,
        email: email,
        password: password,
      });
  
      const savedUser = await user.save();
      res.json(savedUser);
    } catch (err) {
      res.status(500).json({ message: 'Error occured when trying to create account' });
    }
});
  

router.get('/:userId', async (req, res)=>{
    try{
        const user = await User.findById(req.params.userId);
        res.json(user);
    }catch(err){
        res.json({message:err});
    }
})

router.delete('/:userId', async (req, res)=>{
    try{
        const deletedUser = await User.deleteOne({ _id : req.params.userId});
        res.json(deletedUser);
    }catch(err){
        res.json({message:err});
    }
})

router.patch('/:userId', async (req, res)=>{
    try{
        const updatedUser = await User.updateOne(
            { _id : req.params.userId}, 
            {$set: {username: req.body.username, email: req.body.email, password: req.body.password } });
        res.json(updatedUser);
    }catch(err){
        res.json({message:err});
    }
})

//favorites
router.post('/:userId/favorites/:memeId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const meme = await Meme.findById(req.params.memeId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.favorites.includes(meme)) {
        return res.status(400).json({ message: 'Meme already in favorites' });
      }else{
        user.favorites.push(meme);
        await user.save();
        res.status(200).json({ message: 'Meme added to favorites' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error occured when trying to add favorites' });
    }
});

//following and unfollowing
router.post('/:userId/friendlist/:friendId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const friend = await User.findById(req.params.friendId);
  
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
    
        if (!friend) {
            return res.status(404).json({ message: 'User not found for following....' });
        }
    
        if (user.following.includes(friend)) {
            return res.status(400).json({ message: 'User is already in following list' });
        }else{
            user.following.push(friend);
            user.following_count++
            friend.followers.push(user);
            friend.follower_count++;
            await Promise.all([user.save(), friend.save()]);
            res.status(200).json({ message: 'User added to following list' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occured while trying to follow this user' });
    }
});

router.get('/:userId/followers', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).populate('followers', 'username');
    
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const followers = user.followers.map(follower => follower.username);
      const followerCount = user.follower_count.length;
      
      res.status(200).json({ followers, followerCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error occurred while fetching user followers' });
    }
});
router.get('/:userId/following', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).populate('following', 'username');
    
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const following = user.following.map(following => following.username);
      const followingCount = user.following_count.length;
      
      res.status(200).json({ following, followingCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error occurred while fetching user followers' });
    }
});

router.delete('/:userId/unfollow/:friendId', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      const friend = await User.findById(req.params.friendId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (!friend) {
        return res.status(404).json({ message: 'User not found for unfollowing....' });
      }
  
      if (user.following.some(followingId => followingId.equals(friend._id))) {
        user.following.pull(friend._id);
        user.following_count--;
    
        friend.followers.pull(user._id);
        friend.follower_count--;
    
        await Promise.all([user.save(), friend.save()]);
        res.status(200).json({ message: 'User removed from following list' });
      } else {
        return res.status(400).json({ message: 'User is not in the following list' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error occurred while trying to unfollow this user' });
    }
});

//blocking content and people
router.post('/:userId/block/:memeId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const meme = await Meme.findById(req.params.memeId);
  
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
    
        if (!meme) {
            return res.status(404).json({ message: 'Meme not found' });
        }
    
        if (user.blocked_content.includes(meme)) {
            return res.status(400).json({ message: 'This meme was already blocked. If it is still available, please file a report' });
        }else{
            user.blocked_content.push(meme);
            await user.save();
            res.status(200).json({ message: 'Meme has been blocked' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occured while trying to block this meme' });
    }
});

router.post('/:userId/block_people/:blockId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const blocked_user = await User.findById(req.params.blockId);
  
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
    
        if (!blocked_user) {
            return res.status(404).json({ message: 'User not found' });
        }
    
        if (user.blocked_people.includes(blocked_user)) {
            return res.status(400).json({ message: 'This user was already blocked. If they are still bothering you, please file a report' });
        }else{
            user.blocked_people.push(blocked_user);
            await user.save();
            res.status(200).json({ message: 'User has been blocked' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occured while trying to block this user' });
    }
});

//creating and adding content to playlists
router.post('/:userId/playlists', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      const playlistName = req.body.name;
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const existingPlaylist = user.playlists.find(p => p.name === playlistName);
      if (existingPlaylist) {
        return res.status(400).json({ message: 'Playlist with the same name already exists' });
      }else{
        const newPlaylist = {
            name: playlistName,
            memes: [],
        };
        user.playlists.push(newPlaylist);
        await user.save();
        res.status(200).json({ message: 'Playlist created successfully', playlist: newPlaylist });
      }
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error occurred while creating playlist' });
    }
});
  
router.post('/:userId/add_playlists/:playlistName/:memeId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const meme = await Meme.findById(req.params.memeId);
        const playlistName = req.params.playlistName;
    
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
    
        const playlist = user.playlists.find(p => p.name === playlistName);
        if (!playlist) {
                return res.status(404).json({ message: 'Playlist not found, create a playlist and try again' });
        } 
        if (playlist.memes.length >= 20) {
            return res.status(400).json({ message: 'Playlist limit reached. Create a new playlist.' });
        } else {
            if(!meme) {
                playlist.memes.push(meme);
                await user.save();
                res.status(200).json({ message: 'Meme added to playlist' });
            }else{
                return res.status(400).json({ message: 'Meme already exists in the playlist, try adding another one' });
            }
        }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error occurred while trying to add meme to playlist' });
    }
});

//getting user preferences
router.get('/:userId/preferences', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('favorites');
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }else{
        const favoriteMemes = user.favorites;
        const preferences = favoriteMemes
          .map(meme => meme.category)
          .filter(category => category);
    
        res.status(200).json({ preferences });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error occurred while fetching user preferences' });
    }
});

//sharing memes
router.post('/:userId/share/:memeId', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      const meme = await Meme.findById(req.params.memeId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (!meme) {
        return res.status(404).json({ message: 'Meme not found' });
      }
      meme.shared_count += 1;
      await meme.save();

      user.sharedMemes.push({
        meme: meme._id,
        timestamp: Date.now(),
      });
      await user.save();
  
      res.status(200).json({ message: 'Meme shared successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error occurred while trying to share the meme' });
    }
});
  
//sending messages and receiving messages, also viewing all messages
router.post('/:userId/send_message/:recipientId', async (req, res) => {
    try {
      const sender = await User.findById(req.params.userId);
      const recipient = await User.findById(req.params.recipientId);
      const messageContent = req.body.content;
  
      if (!sender) {
        return res.status(404).json({ message: 'Sender not found' });
      }
  
      if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found' });
      }
      const message = {
        sender: sender._id,
        recipient: recipient._id,
        content: messageContent,
        timestamp: Date.now()
      };
      sender.sentMessages.push(message);
      recipient.receivedMessages.push(message);

      await Promise.all([sender.save(), recipient.save()]);
  
      res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error occurred while sending the message' });
    }
});

router.get('/:userId/messages', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId)
        .populate('sentMessages.recipient', 'username')
        .populate('receivedMessages.sender', 'username');
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const sentMessages = user.sentMessages;
      const receivedMessages = user.receivedMessages;
 
      const uniqueSentRecipients = new Set();
      for (const message of sentMessages) {
        uniqueSentRecipients.add(message.recipient.toString());
      }
      const sentChatCount = uniqueSentRecipients.size;
 
      const uniqueReceivedSenders = new Set();
      for (const message of receivedMessages) {
        uniqueReceivedSenders.add(message.sender.toString());
      }
      const receivedChatCount = uniqueReceivedSenders.size;

      const combinedChatParticipants = new Set([
        ...uniqueSentRecipients,
        ...uniqueReceivedSenders,
      ]);
      
      const chatCount = combinedChatParticipants.size;
      user.chat_count = chatCount;
        await user.save();
  
      res.status(200).json({ sentMessages, receivedMessages, chatCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error occurred while fetching user messages' });
    }
});

router.post('/:userId/messages/reply/:messageId', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      const messageId = req.params.messageId;
      const messageContent = req.body.content;
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const message = user.receivedMessages.find(
        (message) => message._id.toString() === messageId
      );
  
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
  
      const recipientId = message.sender._id;
  
      const replyMessage = {
        sender: user._id,
        recipient: recipientId,
        content: messageContent,
      };
  
      user.sentMessages.push(replyMessage);
  
      // Check if the chatbox already exists
      const chatboxExists = user.receivedMessages.some(
        (msg) =>
          msg.sender._id.toString() === recipientId.toString() &&
          msg.recipient.toString() === user._id.toString()
      );
  
      if (!chatboxExists) {
        user.chatCount++;
      }
  
      await Promise.all([user.save()]);
  
      res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error occurred while replying to the message' });
    }
});

//downloading a meme


//creating a report and getting support
  

export default router;