import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Star from '@material-ui/icons/Star';
import StarBorder from '@material-ui/icons/StarBorder';
import Avatar from '@material-ui/core/Avatar';
import ReactHtmlParser from 'react-html-parser';
import '../styles/singleBlogPage.css';
import { DateTime } from 'luxon';

const CommentForm = ({ user, blog, setBlog }) => {
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
      setBlog(response.data);
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
};

const SingleBlogPage = ({
  blog, setBlog, user, setAllBlogs, allBlogs,
}) => {
  console.log(blog, allBlogs);
  if (!blog) return null;
  const dateNow = DateTime.local();
  const blogDate = DateTime.fromISO(blog.date);

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

  const calculateDateDiff = (date) => {
    const daysAgo = Math.floor(dateNow.diff(DateTime.fromISO(date)).as('days'));
    if (daysAgo >= 1) {
      if (daysAgo === 1) {
        return '1 day ago';
      }
      return `${daysAgo} days ago`;
    }
    const hoursAgo = Math.floor(
      dateNow.diff(DateTime.fromISO(date)).as('hours'),
    );
    if (hoursAgo >= 1) {
      if (hoursAgo === 1) {
        return '1 hour ago';
      }
      return `${hoursAgo} hours ago`;
    }
    const minutesAgo = Math.floor(
      dateNow.diff(DateTime.fromISO(date)).as('minutes'),
    );
    if (minutesAgo >= 1) {
      if (minutesAgo === 1) {
        return '1 minute ago';
      }
      return `${minutesAgo} minutes ago`;
    }
    return 'less than a minute ago';
  };

  return (
    <div className="main-blog-page-container">
      <Container maxWidth="md">
        <div>
          <h1 id="blog-title">{blog.title}</h1>
          <img src={blog.headerImageURL} alt="cover" width="1000px" />
          <div className="author-container">
            <div className="author-picture">
              <Avatar alt="author profile" src={blog.author.avatar} />
            </div>
            <div className="blog-info-container">
              <div className="author-username">
                <Link id="blog-author-link" to={`/users/${blog.author.id}`}>
                  <h3>{blog.author.username}</h3>
                </Link>
              </div>
              <div className="blog-info-date">
                {blogDate.monthLong}
                {blogDate.day}
              </div>
            </div>
          </div>
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
            stars
          </div>
        </div>
        <div className="blog-comment-section-container">
          <div className="blog-comment-form">
            <CommentForm
              user={user}
              blog={blog}
              setBlog={setBlog}
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
                </div>
              </li>
            ))}
          </ul>
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
};

export default SingleBlogPage;
