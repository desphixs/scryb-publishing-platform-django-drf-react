# Importing standard Django shortcuts
from django.shortcuts import render

# Importing REST Framework base view classes and decorator helpers
from rest_framework.views import APIView

# Importing standardized HTTP response modules
from rest_framework.response import Response

# Importing standard HTTP status code definitions
from rest_framework import status

# Importing permissions systems to control user credentials validation
from rest_framework import permissions

# Importing our Post database model
from .models import Post

# Importing our JSON serializer mapper
from .serializers import PostSerializer

class PostListCreateView(APIView):
    """
    PostListCreateView handles listing all published posts (public read)
    and creating a new post (authenticated write).
    
    Analogy:
    Think of this view like a library reception desk.
    - Anyone walking in off the street can look at the main public book catalog (GET request).
    - However, if you want to donate or register a brand-new book in the collection (POST request),
      the receptionist will require you to present your official library membership card first.
    """
    
    # We set IsAuthenticatedOrReadOnly as our primary permission rule.
    # This allows any anonymous user to view posts (GET),
    # but restricts post creation (POST) only to authenticated logged-in users.
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, *args, **kwargs):
        """
        Manually handles GET requests to fetch and list all published articles.
        This endpoint is public, so no authentication token is required.
        """
        # 1. Fetch only the posts that have status set to 'published' from SQLite
        # We sort them by newest first (defined by the Meta ordering in the model)
        posts = Post.objects.filter(status='published')
        
        # 2. Convert our list of Post database objects into a JSON array structure
        # We set many=True because we are serializing a list/QuerySet of multiple items
        serializer = PostSerializer(posts, many=True)
        
        # 3. Return the JSON array data accompanied by a standard 200 OK HTTP status code
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        """
        Manually handles POST requests to create a brand new article.
        This endpoint requires a valid authorization token.
        """
        # 1. Pass the submitted request body data directly into our serializer
        serializer = PostSerializer(data=request.data)
        
        # 2. Check if the submitted values satisfy our model and serializer validation rules
        if serializer.is_valid():
            # If the fields are valid, save the new Post directly to SQLite!
            # We explicitly pass user=request.user to the save() method.
            # This links the post to the currently logged-in authenticated user/author,
            # preventing any malicious attempts to hijack someone else's author credit.
            post = serializer.save(user=request.user)
            
            # 3. Return the serialized JSON data of the newly created post,
            # accompanied by a standard 201 Created HTTP status code.
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        # 4. If any validation rules fail (e.g. missing title, duplicate slug),
        # return the error dict accompanied by a 400 Bad Request status code.
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
