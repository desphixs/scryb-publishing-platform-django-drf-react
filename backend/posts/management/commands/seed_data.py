# Importing the BaseCommand class to create a custom Django management command
from django.core.management.base import BaseCommand

# Importing the Django shell wrapper to handle database transaction safety
from django.db import transaction

# Importing our database models
from posts.models import Post, Comment, Like

# Importing our custom User model
from django.contrib.auth import get_user_model

# Fetching the active User model defined in our settings
User = get_user_model()

class Command(BaseCommand):
    """
    Management command to seed the database with realistic sample data
    for users, posts, comments, and likes.
    """
    
    # Text shown when running 'python manage.py seed_data --help'
    help = 'Seeds the database with test users, articles, comments, and reactions.'

    def handle(self, *args, **options):
        # We wrap all database changes in a transaction to ensure complete success or complete fallback
        with transaction.atomic():
            self.stdout.write(self.style.WARNING("Starting database seed process..."))

            # --------------------------------------------------------------------------
            # 1. Clean existing records in posts, comments, and likes
            # --------------------------------------------------------------------------
            self.stdout.write("Scrubbing previous posts database records...")
            Like.objects.all().delete()
            Comment.objects.all().delete()
            Post.objects.all().delete()

            # --------------------------------------------------------------------------
            # 2. Get or create test users
            # --------------------------------------------------------------------------
            self.stdout.write("Generating seed users...")
            
            # Create user Priya (our primary UX designer character)
            priya, priya_created = User.objects.get_or_create(
                email="priya@example.com",
                defaults={
                    "full_name": "Priya Patel",
                    "is_active": True
                }
            )
            if priya_created:
                # Set password securely
                priya.set_password("password123")
                priya.save()
                
                # Add bio and settings preferences
                priya.profile.bio = "UX researcher and designer who writes about design, psychology, and technology."
                priya.profile.avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                priya.profile.save()

            # Create user Alex (our software engineer peer reviewer)
            alex, alex_created = User.objects.get_or_create(
                email="alex@example.com",
                defaults={
                    "full_name": "Alex Mercer",
                    "is_active": True
                }
            )
            if alex_created:
                alex.set_password("password123")
                alex.save()
                
                alex.profile.bio = "Full-stack software engineer focusing on backend architectures and database efficiency."
                alex.profile.avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                alex.profile.save()

            self.stdout.write(f"Seed users complete: {priya.email} and {alex.email}")

            # --------------------------------------------------------------------------
            # 3. Create at least 3 high-quality articles (Posts)
            # --------------------------------------------------------------------------
            self.stdout.write("Generating sample Markdown posts...")

            post1 = Post.objects.create(
                title="Understanding HSL Color Systems in Modern Design",
                slug="understanding-hsl-color-systems-in-modern-design",
                body=(
                    "# Understanding HSL Color Systems\n\n"
                    "Color is one of the most powerful tools in a designer's toolkit. Yet, many web developers "
                    "still rely entirely on HEX codes (`#ff0000`) or RGB numbers (`rgb(255, 0, 0)`). While these formats "
                    "work perfectly for computers, they are incredibly difficult for humans to read or manipulate intuitively.\n\n"
                    "## Why HSL is a Game Changer\n\n"
                    "HSL stands for **Hue, Saturation, and Lightness**:\n"
                    "- **Hue** represents the color itself, measured in degrees on a 360° color wheel (0 is red, 120 is green, 240 is blue).\n"
                    "- **Saturation** is the intensity/richness of the color, from 0% (completely gray) to 100% (fully vibrant).\n"
                    "- **Lightness** controls the brightness, from 0% (pitch black) to 100% (pure white).\n\n"
                    "By using HSL, creating harmonic color systems or dynamic dark modes becomes as simple as modifying "
                    "a single percentage! Next time you configure styles, try `hsl(210, 80%, 50%)` and see the difference."
                ),
                status="published",
                user=priya
            )

            post2 = Post.objects.create(
                title="How Psychology Shapes our User Experience",
                slug="how-psychology-shapes-our-user-experience",
                body=(
                    "# The Psychology of UX Design\n\n"
                    "Every time a user visits your app, their brain is constantly processing layout patterns, anticipating "
                    "interactions, and deciding whether your product is trustworthy. Great user experiences are not born "
                    "by accident—they are designed in alignment with human psychology.\n\n"
                    "## Core Cognitive Rules in UI Design\n\n"
                    "### 1. Hick's Law\n"
                    "The time it takes to make a decision increases with the number and complexity of choices. "
                    "Keep forms minimalist, avoid massive list displays, and guide users with single prominent buttons.\n\n"
                    "### 2. Jakob's Law\n"
                    "Users spend most of their time on other sites. This means they expect your application to behave "
                    "similarly to what they already know. Avoid unconventional nav bars or weird click boundaries.\n\n"
                    "Designing with these psychological foundations is what separates good sites from premium, award-winning applications."
                ),
                status="published",
                user=priya
            )

            post3 = Post.objects.create(
                title="Building Scalable APIs with Django and Next.js",
                slug="building-scalable-apis-with-django-and-next-js",
                body=(
                    "# Building RESTful Architectures\n\n"
                    "When building full-stack applications, the way your backend server sends data to the frontend browser "
                    "determines the speed and maintainability of your entire project.\n\n"
                    "Using Django REST Framework (DRF) allows you to define hand-written `APIView` components. This explicit "
                    "approach ensures complete transparency in how data is unpacked from requests, validated, and returned "
                    "as clean JSON. When coupled with Next.js App Router for server pre-rendering, you achieve state-of-the-art "
                    "performance and optimized search engine indexing out of the box."
                ),
                status="published",
                user=alex
            )

            # We also create a draft post to test privacy constraints later
            post_draft = Post.objects.create(
                title="Draft: My Secret Design Manifesto",
                slug="draft-my-secret-design-manifesto",
                body=(
                    "# Secret Design Rules\n\n"
                    "This is a private draft containing early thoughts on design guidelines. It should only be visible "
                    "to the author when logged in, and kept completely hidden from public listings."
                ),
                status="draft",
                user=priya
            )

            self.stdout.write(f"Sample posts successfully created: {Post.objects.count()} posts total.")

            # --------------------------------------------------------------------------
            # 4. Generate comments
            # --------------------------------------------------------------------------
            self.stdout.write("Generating sample comments...")
            
            # Alex comments on Priya's UX Psychology article
            Comment.objects.create(
                body="This is an absolute masterpiece, Priya! Hick's Law is so overlooked when developers throw dozens of configuration inputs onto a single settings card. Simplifying layout choices makes a massive difference.",
                post=post2,
                user=alex
            )

            # Priya comments back on Alex's API architecture article
            Comment.objects.create(
                body="Spot on, Alex! The explicit data pipeline in Django makes it so easy to follow database query paths. It completely removes the 'magic' and teaches solid systems engineering.",
                post=post3,
                user=priya
            )

            self.stdout.write(f"Sample comments successfully created: {Comment.objects.count()} comments total.")

            # --------------------------------------------------------------------------
            # 5. Generate likes
            # --------------------------------------------------------------------------
            self.stdout.write("Generating sample reactions (likes)...")
            
            # Alex likes post 1 and post 2
            Like.objects.create(post=post1, user=alex)
            Like.objects.create(post=post2, user=alex)
            
            # Priya likes post 3
            Like.objects.create(post=post3, user=priya)

            self.stdout.write(f"Sample likes successfully created: {Like.objects.count()} reactions total.")

            self.stdout.write(self.style.SUCCESS("Database seeding completed successfully! Ready for full-stack testing."))
