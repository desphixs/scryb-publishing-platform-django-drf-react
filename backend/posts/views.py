# Importing standard Django shortcuts
from django.shortcuts import render, get_object_or_404

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


class PostDetailView(APIView):
    """
    PostDetailView handles retrieving (GET), updating (PUT), and deleting (DELETE)
    a single specific post identified by its unique slug parameter.
    
    Analogy:
    Think of this view like accessing a private, high-security archive room.
    - Anyone can ask to read a public document that is fully published (GET).
    - If the document is still a rough draft, the archivist will refuse to show it to the public,
      only allowing the original author to read it.
    - If a visitor tries to edit the text (PUT) or throw the document in the shredder (DELETE),
      the archivist checks their ID badge: only the original author is permitted to make alterations.
    """
    
    # We set IsAuthenticatedOrReadOnly to allow anyone to read public posts,
    # but require authentication to make modifications or delete items.
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, slug, *args, **kwargs):
        """
        Retrieves the details of a single post by its URL slug.
        Public posts can be read by anyone. Draft posts are restricted to the author.
        """
        # 1. Look up the specific post in SQLite by its unique slug.
        # If no post matches the slug, Django immediately returns a standard 404 Not Found error.
        post = get_object_or_404(Post, slug=slug)
        
        # 2. Privacy Check: If the post is a draft, make sure only the original author can see it
        if post.status == 'draft':
            # Check if the user is logged in AND is the author of this post
            if not request.user.is_authenticated or request.user != post.user:
                # If they are not the author, we return a 404 Not Found response.
                # This is a secure best-practice so bad actors don't even know the draft slug exists!
                return Response(
                    {"detail": "No Post matches the given query."},
                    status=status.HTTP_404_NOT_FOUND
                )
                
        # 3. Serialize the single Post database row into a JSON object
        serializer = PostSerializer(post)
        
        # 4. Return the post data with a 200 OK status
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, slug, *args, **kwargs):
        """
        Updates the details of an existing post. Only the author can perform this action.
        """
        # 1. Fetch the target post from the database by its unique slug
        post = get_object_or_404(Post, slug=slug)
        
        # 2. Authorization Check: Verify that the logged-in user is indeed the owner/author of the post
        if request.user != post.user:
            # If someone else tries to edit, reject them with a 403 Forbidden status
            return Response(
                {"detail": "You do not have permission to edit this article."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # 3. Pass the target post instance and the new request data into our serializer.
        # We also support partial updates (e.g. updating just the title or just the body).
        serializer = PostSerializer(post, data=request.data, partial=True)
        
        # 4. Validate the submitted fields
        if serializer.is_valid():
            # Save the updated post details back to the database
            serializer.save()
            # Return the updated post data with a 200 OK status
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        # 5. If validation fails, return the errors dictionary with a 400 Bad Request
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug, *args, **kwargs):
        """
        Permanently deletes an article from the database. Only the author can perform this action.
        """
        # 1. Fetch the target post by its unique slug
        post = get_object_or_404(Post, slug=slug)
        
        # 2. Authorization Check: Confirm the active user is the post's original author
        if request.user != post.user:
            # Reject deletion attempts from other users
            return Response(
                {"detail": "You do not have permission to delete this article."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # 3. Permanently erase the post record from our SQLite database
        post.delete()
        
        # 4. Return a successful 204 No Content response, indicating deletion complete
        return Response(status=status.HTTP_204_NO_CONTENT)
