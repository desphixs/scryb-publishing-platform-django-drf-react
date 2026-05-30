# Importing Django's built-in models module to define our database tables
from django.db import models

# Importing the global settings object to reference the custom User model
from django.conf import settings

# This list defines the choices for the status of a post.
# Choice options are stored as a tuple of tuples.
# The first element in each inner tuple is what is saved in the database ('draft' or 'published').
# The second element is the human-readable label shown in the admin panel ('Draft' or 'Published').
STATUS_CHOICES = (
    ('draft', 'Draft'),
    ('published', 'Published'),
)

class Post(models.Model):
    """
    The Post model represents an individual article written by a user.
    Each post will store its title, slug, body content, status, and timestamps.
    """
    
    # The title of the article. It has a maximum length of 250 characters.
    title = models.CharField(
        max_length=250,
        help_text="Enter the title of the article."
    )
    
    # A slug is a URL-friendly version of the title.
    # For example, a title "My First Post" becomes "my-first-post".
    # We enforce unique=True so that no two posts can have the same URL slug.
    slug = models.SlugField(
        max_length=250,
        unique=True,
        help_text="A unique, URL-friendly label generated from the title."
    )
    
    # The main content of the post, which will contain Markdown text.
    # We use a TextField because the body of an article can be very long.
    body = models.TextField(
        help_text="Write your article body content here using Markdown formatting."
    )
    
    # The publishing status of the article, defaulting to 'draft' so it's not made public instantly.
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        help_text="Set the post status to Draft or Published."
    )
    
    # A ForeignKey connects this Post to a specific User in the database.
    # settings.AUTH_USER_MODEL points to the active User model defined in settings.py.
    # on_delete=models.CASCADE means if a user is deleted, all their posts will also be deleted automatically.
    # related_name='posts' allows us to fetch all posts by a user using `user.posts.all()`.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts',
        help_text="The author who wrote this post."
    )
    
    # Automatically records the date and time when a post is first created.
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    
    # Automatically updates the date and time whenever the post is saved or modified.
    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        # Sorts posts so that the newest articles appear first by default
        ordering = ('-created_at',)

    def __str__(self):
        # Returns the human-readable title when referencing the object
        return self.title


class Comment(models.Model):
    """
    The Comment model represents an interactive comment left on a post.
    Every comment belongs to a specific post and is written by a specific user.
    """
    
    # The text content of the comment.
    body = models.TextField(
        help_text="Enter your comment text."
    )
    
    # Links the comment to a single specific Post.
    # If the post is deleted, all its comments are deleted automatically (CASCADE).
    # related_name='comments' lets us do `post.comments.all()` to get all comments for a post.
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="The post this comment belongs to."
    )
    
    # Links the comment to a single specific User who wrote it.
    # If the user is deleted, their comments are deleted automatically (CASCADE).
    # related_name='comments' lets us do `user.comments.all()` to find all comments written by this user.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="The user who wrote this comment."
    )
    
    # Records when the comment was created automatically.
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        # Sorts comments so that the oldest comments appear first (standard conversation order)
        ordering = ('created_at',)

    def __str__(self):
        # Truncates comment text in admin listings for readability
        return f"Comment by {self.user.email} on {self.post.title}"


class Like(models.Model):
    """
    The Like model represents a positive reaction to a post.
    A user can like a post to show appreciation.
    """
    
    # Links the reaction to a specific Post.
    # If the post is deleted, its likes are deleted too (CASCADE).
    # related_name='likes' lets us fetch all likes on a post using `post.likes.all()`.
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='likes',
        help_text="The post that was liked."
    )
    
    # Links the reaction to a specific User.
    # If the user is deleted, their likes are deleted too (CASCADE).
    # related_name='likes' lets us see all likes given by a user using `user.likes.all()`.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='likes',
        help_text="The user who liked the post."
    )
    
    # Records when the like was created.
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        # Unique Together constraint prevents a user from liking the same post more than once.
        # This is a database-level rule that guarantees data integrity.
        unique_together = ('post', 'user')

    def __str__(self):
        # Helpful string representation
        return f"{self.user.email} liked {self.post.title}"
