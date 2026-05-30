# Importing Django's built-in path function to map URLs to views
from django.urls import path

# Importing our post views from our local views file
from .views import PostListCreateView, PostDetailView

# Defining the namespace for this URL file
app_name = 'posts'

# A list of URL patterns that map incoming paths to views
urlpatterns = [
    # Map the root path of this app to our PostListCreateView.
    # When a user calls GET /api/posts/ or POST /api/posts/, this path triggers.
    path('posts/', PostListCreateView.as_view(), name='post-list-create'),

    # Map the detail path capturing a dynamic string parameter slug in the URL.
    # When a user calls GET, PUT, or DELETE /api/posts/<slug>/, this path triggers.
    path('posts/<slug:slug>/', PostDetailView.as_view(), name='post-detail'),
]

