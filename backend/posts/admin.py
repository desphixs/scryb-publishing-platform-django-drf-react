# Importing Django's built-in administration module
from django.contrib import admin

# Importing the models we want to register from our local models file
from .models import Post, Comment, Like

# We use the admin.register decorator to link our Post model to this custom PostAdmin configuration
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """
    Customizing how the Post model is displayed and managed inside the Django Admin Panel.
    This provides our admins with an elegant dashboard to search, filter, and review articles.
    """
    
    # Defines the columns displayed on the Post listing page in the admin panel
    list_display = ('title', 'slug', 'user', 'status', 'created_at')
    
    # Adds a sidebar filter panel allowing admins to filter posts by status, creation date, or author
    list_filter = ('status', 'created_at', 'user')
    
    # Enables a search bar targeting the post title, post content, and the author's email
    search_fields = ('title', 'body', 'user__email')
    
    # Automatically fills in the slug field in real-time as the admin typess in the title field!
    # This is a huge timesaver and prevents slug format errors.
    prepopulated_fields = {'slug': ('title',)}
    
    # Changes the default dropdown for the author/user field to a searchable raw-id input,
    # which is extremely important for scalability when there are thousands of registered users.
    raw_id_fields = ('user',)
    
    # Organizes the layout of the creation/edit form in the admin panel
    date_hierarchy = 'created_at'


# Registering the Comment model with a basic listing customization
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """
    Customizing the Comment model display in the Admin Panel.
    """
    # Columns displayed in the list view
    list_display = ('user', 'post', 'created_at')
    
    # Adds filters on creation date and user
    list_filter = ('created_at', 'user')
    
    # Enables search by comment body and author's email
    search_fields = ('body', 'user__email', 'post__title')


# Registering the Like model so administrators can view reactions
@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    """
    Customizing the Like model display in the Admin Panel.
    """
    # Columns displayed in the list view
    list_display = ('user', 'post', 'created_at')
    
    # Adds filters on creation date and user
    list_filter = ('created_at', 'user')
