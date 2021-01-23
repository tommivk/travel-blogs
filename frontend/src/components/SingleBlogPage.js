/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Star from '@material-ui/icons/Star';
import StarBorder from '@material-ui/icons/StarBorder';
import ChatBubbleOutline from '@material-ui/icons/ChatBubbleOutline';
import Explore from '@material-ui/icons/Explore';
import Avatar from '@material-ui/core/Avatar';
import ReactHtmlParser from 'react-html-parser';
import '../styles/singleBlogPage.css';
import { DateTime } from 'luxon';
import ConfirmDialog from './ConfirmDialog';
import calculateDateDiff from '../utils/calculateDateDiff';

const CommentForm = ({
  user, blog, setBlog, allBlogs, setAllBlogs,
}) => {
  const [comment, setComment] = useState('');

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const newComment = {
      content: comment,
    };
    try {
      const response = await axios.post(
        `http://localhost:8008/api/blogs/${blog.id}/comments`,
        newComment,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );
      const newBlog = response.data;
      setBlog(newBlog);
      const filteredBlogs = allBlogs.map((b) => (b.id === newBlog.id ? newBlog : b));
      setAllBlogs(filteredBlogs);
      console.log(response.data);
      setComment('');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="comment-form-main-container">
      <form onSubmit={handleCommentSubmit}>
        <div className="comment-form-wrapper">
          <input
            id="comment-form-input"
            type="text"
            value={comment}
            autoComplete="off"
            onChange={({ target }) => setComment(target.value)}
          />
          <Button
            id="comment-form-button"
            variant="contained"
            size="small"
            type="submit"
          >
            send
          </Button>
        </div>
      </form>
    </div>
  );
};

CommentForm.propTypes = {
  user: PropTypes.instanceOf(Object).isRequired,
  blog: PropTypes.instanceOf(Object).isRequired,
  setBlog: PropTypes.func.isRequired,
  allBlogs: PropTypes.instanceOf(Array).isRequired,
  setAllBlogs: PropTypes.func.isRequired,
};

const SingleBlogPage = ({
  blog, setBlog, user, setAllBlogs, allBlogs, handleMessage,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogText, setDialogText] = useState('');
  const [dialogFunction, setDialogFunction] = useState(null);

  useEffect(() => {
    console.log(blog);
  }, [blog]);

  if (!blog) return null;
  const blogDate = DateTime.fromISO(blog.date);

  const handleDialogOpen = (title, text, func) => {
    setDialogTitle(title);
    setDialogText(text);
    setDialogFunction(() => func);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogTitle('');
    setDialogText('');
    setDialogFunction(null);
    setDialogOpen(false);
  };

  const handleDialogConfirm = () => {
    try {
      dialogFunction().then(() => {
        setDialogTitle('');
        setDialogText('');
        setDialogFunction(null);
        setDialogOpen(false);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleStarChange = async (action) => {
    console.log(user, blog);
    const response = await axios.put(
      `http://localhost:8008/api/blogs/${blog.id}/star`,
      { action },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      },
    );
    const newBlog = response.data;
    setBlog(newBlog);
    const filteredBlogs = allBlogs.map((b) => (b.id === newBlog.id ? newBlog : b));

    setAllBlogs(filteredBlogs);
  };

  const handleCommentDelete = async (blogId, commentId) => {
    try {
      const response = await axios.delete(`http://localhost:8008/api/blogs/${blogId}/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
      setBlog(response.data);
      setAllBlogs((allBlogs.map((b) => (b.id === blog.id ? response.data : b))));
      handleMessage('success', 'Comment Deleted');
    } catch (error) {
      handleMessage('error', error.response.data.message);
      console.log(error);
    }
  };

  return (
    <div className="main-blog-page-container">
      <ConfirmDialog
        dialogTitle={dialogTitle}
        dialogText={dialogText}
        dialogOpen={dialogOpen}
        handleDialogConfirm={handleDialogConfirm}
        handleDialogClose={handleDialogClose}
      />
      <Explore id="blog-location-toggle" onClick={() => setShowLocations(!showLocations)} />
      {showLocations
       && (
       <div className="blog-locations-container">
         <h3>Locations</h3>
         {blog.locations.length > 0
           ? (
             <table>
               <tbody>
                 {blog.locations.map((loc) => (
                   <tr>
                     <td>
                       {loc.city}
                     </td>
                     <td>{loc.country}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )
           : <p>No locations</p>}
         <button id="blog-locations-close-button" type="button" onClick={() => setShowLocations(false)}>X</button>
       </div>
       )}
      <Container maxWidth="md">
        <div>
          <div style={{ textAlign: 'center' }}>
            <h1 id="blog-title">{blog.title}</h1>
            <div>
              {blog.description}
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            <div className="author-container">
              <div className="author-picture">
                <Avatar alt="author profile" src={blog.author.avatar} />
              </div>
            </div>
            <div className="blog-info-container">
              <div className="author-username">
                <Link id="blog-author-link" to={`/users/${blog.author.id}`}>
                  <h3>{blog.author.username}</h3>
                </Link>
              </div>
              <div className="blog-info-date">
                {blogDate.monthLong}
                {' '}
                {blogDate.day}
                {' '}
                {blogDate.year}
              </div>
            </div>
          </div>
          {blog.headerImageURL
          && <img src={blog.headerImageURL} alt="cover" width="1000px" />}

          {ReactHtmlParser(blog.content)}
        </div>
        <div className="vote-container">
          <div>
            {blog.stars.includes(user.id) ? (
              <div>
                <Star
                  id="voted-star"
                  fontSize="large"
                  onClick={() => handleStarChange('remove')}
                />
              </div>
            ) : (
              <div>
                <StarBorder
                  id="unvoted-star"
                  fontSize="large"
                  onClick={() => handleStarChange('add')}
                />
              </div>
            )}
          </div>
          <div id="vote-count">
            {blog.stars.length}
            {' '}
          </div>
          <div id="comment-count" onClick={() => setShowComments(!showComments)}>
            <ChatBubbleOutline id="blog-comments-icon" />
            {blog.comments.length}
          </div>
        </div>
        <div className="blog-comment-section-container">
          {showComments
            && (
              <div>
                <div className="blog-comment-form">
                  <CommentForm
                    user={user}
                    blog={blog}
                    setBlog={setBlog}
                    allBlogs={allBlogs}
                    setAllBlogs={setAllBlogs}
                  />
                </div>
                <ul>
                  {blog.comments.map((comment) => (
                    <li key={comment.id}>
                      <div className="blog-comment">
                        <div className="blog-comment-top-section">
                          <img src={comment.user.avatar} alt="avatar" />
                          <div className="blog-comment-username">
                            <Link to={`/users/${comment.user.id}`}>
                              {comment.user.username}
                            </Link>
                          </div>
                          <div className="blog-comment-date">
                            {calculateDateDiff(comment.date)}
                          </div>
                        </div>
                        <div className="blog-comment-content">{comment.content}</div>
                        {comment.user.id === user.id
                         && <div><button type="button" onClick={() => handleDialogOpen('Delete Comment?', '', () => handleCommentDelete(blog.id, comment.id))}>Delete</button></div> }
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      </Container>
    </div>
  );
};

SingleBlogPage.defaultProps = {
  blog: null,
};

SingleBlogPage.propTypes = {
  blog: PropTypes.instanceOf(Object),
  setBlog: PropTypes.func.isRequired,
  user: PropTypes.instanceOf(Object).isRequired,
  setAllBlogs: PropTypes.func.isRequired,
  allBlogs: PropTypes.instanceOf(Array).isRequired,
  handleMessage: PropTypes.func.isRequired,
};

export default SingleBlogPage;
