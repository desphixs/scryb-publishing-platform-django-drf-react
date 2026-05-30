# Importing the standard serializers module from Django REST Framework
from rest_framework import serializers

# Importing our custom User model via the active get_user_model utility
from django.contrib.auth import get_user_model

# Importing our Post database model
from .models import Post

# Retrieve the active User model defined in our settings
User = get_user_model()

class UserAuthorSerializer(serializers.ModelSerializer):
    """
    A read-only serializer to map basic author credentials (ID, email, and full name)
    so they can be nested cleanly inside post lists and detail feeds.
    """
    class Meta:
        # Connect this serializer to the custom User model
        model = User
        # Define the exact columns to expose to public readers
        fields = ['id', 'email', 'full_name']


class PostSerializer(serializers.ModelSerializer):
    """
    The PostSerializer maps our Post model records to/from JSON data structures.
    It separates the read-only user relation from the writeable fields,
    keeping our database transactions secure and explicit.
    """
    
    # We nest the UserAuthorSerializer here to display the author details in API responses.
    # We set read_only=True because we don't want the client to manually submit or alter the author.
    # The author will always be resolved explicitly in the view based on the authenticated session.
    user = UserAuthorSerializer(read_only=True)

    class Meta:
        # Hook this serializer to the Post database model
        model = Post
        # Define all fields to include in serialized JSON payloads
        fields = [
            'id', 
            'title', 
            'slug', 
            'body', 
            'status', 
            'user', 
            'created_at', 
            'updated_at'
        ]
        
        # Read-only fields that cannot be altered by POST/PUT body payloads
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_slug(self, value):
        """
        Custom field-level validator to ensure slugs are formatted safely.
        For example, a valid slug should not contain uppercase letters or spaces.
        """
        # Checks if the slug is lowercase, alphanumeric, and uses hyphens/underscores
        import re
        if not re.match(r'^[a-z0-9-_]+$', value):
            raise serializers.ValidationError(
                "Slugs must be lowercase, alphanumeric, and contain only hyphens or underscores."
            )
        return value
