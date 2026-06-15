from __future__ import annotations

import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class TextChoicesBase(models.TextChoices):
    @classmethod
    def values_set(cls) -> set[str]:
        return {value for value, _label in cls.choices}


class LanguageCode(TextChoicesBase):
    AR = "ar", "Arabic"
    EN = "en", "English"


class ThemeCode(TextChoicesBase):
    BLUE_TECH = "blue-tech", "Blue Tech"
    EMERALD_LUXURY = "emerald-luxury", "Emerald Luxury"


class UserStatus(TextChoicesBase):
    ACTIVE = "active", "Active"
    INACTIVE = "inactive", "Inactive"
    SUSPENDED = "suspended", "Suspended"


class PublishStatus(TextChoicesBase):
    DRAFT = "draft", "Draft"
    PUBLISHED = "published", "Published"
    ARCHIVED = "archived", "Archived"


class ProductType(TextChoicesBase):
    WEB = "web", "Web"
    DESKTOP = "desktop", "Desktop"
    MOBILE = "mobile", "Mobile"
    SAAS = "saas", "SaaS"
    API = "api", "API"
    OTHER = "other", "Other"


class ProductStatus(TextChoicesBase):
    AVAILABLE = "available", "Available"
    COMING_SOON = "coming_soon", "Coming Soon"
    IN_DEVELOPMENT = "in_development", "In Development"
    HIDDEN = "hidden", "Hidden"


class AppType(TextChoicesBase):
    WEB = "web", "Web"
    DESKTOP = "desktop", "Desktop"
    MOBILE = "mobile", "Mobile"
    TOOL = "tool", "Tool"
    API = "api", "API"
    OTHER = "other", "Other"


class AppPlatform(TextChoicesBase):
    WEB = "web", "Web"
    WINDOWS = "windows", "Windows"
    MACOS = "macos", "macOS"
    LINUX = "linux", "Linux"
    ANDROID = "android", "Android"
    IOS = "ios", "iOS"
    CROSS_PLATFORM = "cross_platform", "Cross Platform"
    OTHER = "other", "Other"


class AppStatus(TextChoicesBase):
    AVAILABLE = "available", "Available"
    BETA = "beta", "Beta"
    COMING_SOON = "coming_soon", "Coming Soon"
    IN_DEVELOPMENT = "in_development", "In Development"
    HIDDEN = "hidden", "Hidden"


class AppPricingType(TextChoicesBase):
    FREE = "free", "Free"
    PAID = "paid", "Paid"
    FREEMIUM = "freemium", "Freemium"
    CONTACT = "contact", "Contact"


class ProjectType(TextChoicesBase):
    WEBSITE = "website", "Website"
    WEB_APP = "web_app", "Web App"
    DESKTOP_APP = "desktop_app", "Desktop App"
    ADMIN_PANEL = "admin_panel", "Admin Panel"
    SAAS = "saas", "SaaS"
    API_INTEGRATION = "api_integration", "API Integration"
    OTHER = "other", "Other"


class QuoteStatus(TextChoicesBase):
    NEW = "new", "New"
    REVIEWING = "reviewing", "Reviewing"
    CONTACTED = "contacted", "Contacted"
    WAITING_CUSTOMER = "waiting_customer", "Waiting Customer"
    PROPOSAL_SENT = "proposal_sent", "Proposal Sent"
    ACCEPTED = "accepted", "Accepted"
    REJECTED = "rejected", "Rejected"
    COMPLETED = "completed", "Completed"
    ARCHIVED = "archived", "Archived"


class QuotePriority(TextChoicesBase):
    LOW = "low", "Low"
    NORMAL = "normal", "Normal"
    HIGH = "high", "High"
    URGENT = "urgent", "Urgent"


class PreferredContactMethod(TextChoicesBase):
    PHONE = "phone", "Phone"
    WHATSAPP = "whatsapp", "WhatsApp"
    EMAIL = "email", "Email"


class ContactMessageStatus(TextChoicesBase):
    NEW = "new", "New"
    READ = "read", "Read"
    REPLIED = "replied", "Replied"
    ARCHIVED = "archived", "Archived"


class SupportRequestStatus(TextChoicesBase):
    NEW = "new", "New"
    REVIEWING = "reviewing", "Reviewing"
    IN_PROGRESS = "in_progress", "In Progress"
    WAITING_CUSTOMER = "waiting_customer", "Waiting Customer"
    RESOLVED = "resolved", "Resolved"
    CLOSED = "closed", "Closed"
    ARCHIVED = "archived", "Archived"


class MediaType(TextChoicesBase):
    IMAGE = "image", "Image"
    DOCUMENT = "document", "Document"
    OTHER = "other", "Other"


class FaqScope(TextChoicesBase):
    GENERAL = "general", "General"
    SERVICE = "service", "Service"
    PRODUCT = "product", "Product"


class NotificationType(TextChoicesBase):
    QUOTE_REQUEST = "quote_request", "Quote Request"
    CONTACT_MESSAGE = "contact_message", "Contact Message"
    SUPPORT_REQUEST = "support_request", "Support Request"
    PRODUCT_TRIAL = "product_trial", "Product Trial"
    FAILED_LOGIN = "failed_login", "Failed Login"
    FILE_UPLOAD_ERROR = "file_upload_error", "File Upload Error"
    SETTINGS_CHANGED = "settings_changed", "Settings Changed"
    SYSTEM = "system", "System"


class AuditAction(TextChoicesBase):
    LOGIN_SUCCESS = "login_success", "Login Success"
    LOGIN_FAILED = "login_failed", "Login Failed"
    CREATE = "create", "Create"
    UPDATE = "update", "Update"
    DELETE = "delete", "Delete"
    ACTIVATE = "activate", "Activate"
    DEACTIVATE = "deactivate", "Deactivate"
    STATUS_CHANGE = "status_change", "Status Change"
    SETTINGS_CHANGE = "settings_change", "Settings Change"
    THEME_CHANGE = "theme_change", "Theme Change"
    LANGUAGE_CHANGE = "language_change", "Language Change"
    PASSWORD_CHANGE = "password_change", "Password Change"
    EXPORT = "export", "Export"


class AnalyticsEventType(TextChoicesBase):
    PAGE_VIEW = "page_view", "Page View"
    SERVICE_VIEW = "service_view", "Service View"
    PRODUCT_VIEW = "product_view", "Product View"
    PORTFOLIO_VIEW = "portfolio_view", "Portfolio View"
    BLOG_VIEW = "blog_view", "Blog View"
    QUOTE_SUBMIT = "quote_submit", "Quote Submit"
    CONTACT_SUBMIT = "contact_submit", "Contact Submit"


class UUIDTimestampModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_index=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SoftDeleteModel(UUIDTimestampModel):
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True


class Role(UUIDTimestampModel):
    name = models.CharField(max_length=80, unique=True, db_index=True)
    display_name_ar = models.CharField(max_length=120)
    display_name_en = models.CharField(max_length=120)
    description_ar = models.TextField(null=True, blank=True)
    description_en = models.TextField(null=True, blank=True)
    permissions = models.JSONField(default=list)
    is_system = models.BooleanField(default=False)

    class Meta:
        db_table = "roles"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class UserManager(BaseUserManager):
    def create_user(self, username: str, password: str | None = None, **extra_fields):
        if not username:
            raise ValueError("username is required")
        user = self.model(username=username, **extra_fields)
        if password:
            from platform_api.auth import hash_password

            user.hashed_password = hash_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("status", UserStatus.ACTIVE)
        return self.create_user(username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, SoftDeleteModel):
    password = None
    role_id = models.ForeignKey(Role, on_delete=models.RESTRICT, db_column="role_id", related_name="users")
    full_name = models.CharField(max_length=160)
    username = models.CharField(max_length=80, unique=True, db_index=True)
    email = models.EmailField(max_length=255, unique=True, null=True, blank=True, db_index=True)
    phone = models.CharField(max_length=40, null=True, blank=True)
    avatar_url = models.CharField(max_length=500, null=True, blank=True)
    preferred_locale = models.CharField(max_length=10, null=True, blank=True)
    preferred_theme = models.CharField(max_length=80, null=True, blank=True)
    hashed_password = models.CharField(max_length=255)
    status = models.CharField(max_length=30, choices=UserStatus.choices, default=UserStatus.ACTIVE, db_index=True)
    is_superuser = models.BooleanField(default=False)
    last_login_at = models.DateTimeField(null=True, blank=True)
    failed_login_count = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["full_name", "role_id"]
    objects = UserManager()

    @property
    def is_staff(self) -> bool:
        return self.is_superuser

    @property
    def is_active(self) -> bool:
        return self.status == UserStatus.ACTIVE and not self.is_deleted

    class Meta:
        db_table = "users"
        ordering = ["-is_superuser", "-created_at"]

    def __str__(self) -> str:
        return self.username


class SiteSettings(UUIDTimestampModel):
    site_name_ar = models.CharField(max_length=160, default="اسم الشركة")
    site_name_en = models.CharField(max_length=160, default="Software Studio")
    company_legal_name_ar = models.CharField(max_length=180, null=True, blank=True)
    company_legal_name_en = models.CharField(max_length=180, null=True, blank=True)
    company_description_ar = models.TextField(null=True, blank=True)
    company_description_en = models.TextField(null=True, blank=True)
    active_theme = models.CharField(max_length=80, choices=ThemeCode.choices, default=ThemeCode.BLUE_TECH)
    default_language = models.CharField(max_length=10, choices=LanguageCode.choices, default=LanguageCode.AR)
    is_english_enabled = models.BooleanField(default=True)
    logo_url = models.CharField(max_length=500, null=True, blank=True)
    favicon_url = models.CharField(max_length=500, null=True, blank=True)
    email = models.EmailField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=40, null=True, blank=True)
    whatsapp = models.CharField(max_length=40, null=True, blank=True)
    address_ar = models.TextField(null=True, blank=True)
    address_en = models.TextField(null=True, blank=True)
    map_url = models.CharField(max_length=800, null=True, blank=True)
    working_hours_ar = models.CharField(max_length=255, null=True, blank=True)
    working_hours_en = models.CharField(max_length=255, null=True, blank=True)
    support_email = models.EmailField(max_length=255, null=True, blank=True)
    support_phone = models.CharField(max_length=40, null=True, blank=True)
    social_links = models.JSONField(default=dict)
    seo_title_ar = models.CharField(max_length=255, null=True, blank=True)
    seo_title_en = models.CharField(max_length=255, null=True, blank=True)
    seo_description_ar = models.CharField(max_length=500, null=True, blank=True)
    seo_description_en = models.CharField(max_length=500, null=True, blank=True)
    maintenance_mode = models.BooleanField(default=False)
    maintenance_message_ar = models.TextField(null=True, blank=True)
    maintenance_message_en = models.TextField(null=True, blank=True)
    footer_text_ar = models.TextField(null=True, blank=True)
    footer_text_en = models.TextField(null=True, blank=True)
    visible_sections = models.JSONField(default=dict)
    extra_settings = models.JSONField(default=dict)

    class Meta:
        db_table = "site_settings"
        ordering = ["created_at"]


class Service(SoftDeleteModel):
    title_ar = models.CharField(max_length=180)
    title_en = models.CharField(max_length=180)
    slug_ar = models.CharField(max_length=220, unique=True, db_index=True)
    slug_en = models.CharField(max_length=220, unique=True, db_index=True)
    description_ar = models.TextField()
    description_en = models.TextField()
    full_description_ar = models.TextField(null=True, blank=True)
    full_description_en = models.TextField(null=True, blank=True)
    icon = models.CharField(max_length=120, null=True, blank=True)
    image_url = models.CharField(max_length=500, null=True, blank=True)
    seo_title_ar = models.CharField(max_length=255, null=True, blank=True)
    seo_title_en = models.CharField(max_length=255, null=True, blank=True)
    seo_description_ar = models.CharField(max_length=500, null=True, blank=True)
    seo_description_en = models.CharField(max_length=500, null=True, blank=True)
    sort_order = models.IntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    extra_data = models.JSONField(default=dict)

    class Meta:
        db_table = "services"
        ordering = ["sort_order", "-created_at"]


class ServiceFeature(UUIDTimestampModel):
    service_id = models.ForeignKey(Service, on_delete=models.CASCADE, db_column="service_id", related_name="features")
    title_ar = models.CharField(max_length=180)
    title_en = models.CharField(max_length=180)
    description_ar = models.TextField(null=True, blank=True)
    description_en = models.TextField(null=True, blank=True)
    sort_order = models.IntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "service_features"
        ordering = ["sort_order", "created_at"]


class Product(SoftDeleteModel):
    name_ar = models.CharField(max_length=180)
    name_en = models.CharField(max_length=180)
    slug_ar = models.CharField(max_length=220, unique=True, db_index=True)
    slug_en = models.CharField(max_length=220, unique=True, db_index=True)
    short_description_ar = models.TextField()
    short_description_en = models.TextField()
    full_description_ar = models.TextField(null=True, blank=True)
    full_description_en = models.TextField(null=True, blank=True)
    product_type = models.CharField(max_length=40, choices=ProductType.choices, default=ProductType.WEB, db_index=True)
    status = models.CharField(max_length=40, choices=ProductStatus.choices, default=ProductStatus.AVAILABLE, db_index=True)
    main_image_url = models.CharField(max_length=500, null=True, blank=True)
    target_audience_ar = models.TextField(null=True, blank=True)
    target_audience_en = models.TextField(null=True, blank=True)
    requirements_ar = models.TextField(null=True, blank=True)
    requirements_en = models.TextField(null=True, blank=True)
    seo_title_ar = models.CharField(max_length=255, null=True, blank=True)
    seo_title_en = models.CharField(max_length=255, null=True, blank=True)
    seo_description_ar = models.CharField(max_length=500, null=True, blank=True)
    seo_description_en = models.CharField(max_length=500, null=True, blank=True)
    show_demo_request = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    extra_data = models.JSONField(default=dict)

    class Meta:
        db_table = "products"
        ordering = ["sort_order", "-created_at"]


class ProductFeature(UUIDTimestampModel):
    product_id = models.ForeignKey(Product, on_delete=models.CASCADE, db_column="product_id", related_name="features")
    title_ar = models.CharField(max_length=180)
    title_en = models.CharField(max_length=180)
    description_ar = models.TextField(null=True, blank=True)
    description_en = models.TextField(null=True, blank=True)
    sort_order = models.IntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "product_features"
        ordering = ["sort_order", "created_at"]


class ProductImage(UUIDTimestampModel):
    product_id = models.ForeignKey(Product, on_delete=models.CASCADE, db_column="product_id", related_name="images")
    image_url = models.CharField(max_length=500)
    alt_text_ar = models.CharField(max_length=255, null=True, blank=True)
    alt_text_en = models.CharField(max_length=255, null=True, blank=True)
    sort_order = models.IntegerField(default=0, db_index=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = "product_images"
        ordering = ["sort_order", "created_at"]


class ProductFaq(UUIDTimestampModel):
    product_id = models.ForeignKey(Product, on_delete=models.CASCADE, db_column="product_id", related_name="faqs")
    question_ar = models.TextField()
    question_en = models.TextField()
    answer_ar = models.TextField()
    answer_en = models.TextField()
    sort_order = models.IntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "product_faqs"
        ordering = ["sort_order", "created_at"]


class SoftwareApp(SoftDeleteModel):
    name_ar = models.CharField(max_length=180)
    name_en = models.CharField(max_length=180)
    slug_ar = models.CharField(max_length=220, unique=True, db_index=True)
    slug_en = models.CharField(max_length=220, unique=True, db_index=True)
    short_description_ar = models.TextField()
    short_description_en = models.TextField()
    full_description_ar = models.TextField(null=True, blank=True)
    full_description_en = models.TextField(null=True, blank=True)
    app_type = models.CharField(max_length=40, choices=AppType.choices, default=AppType.WEB, db_index=True)
    platform = models.CharField(max_length=40, choices=AppPlatform.choices, default=AppPlatform.WEB, db_index=True)
    status = models.CharField(max_length=40, choices=AppStatus.choices, default=AppStatus.AVAILABLE, db_index=True)
    pricing_type = models.CharField(max_length=40, choices=AppPricingType.choices, default=AppPricingType.FREE, db_index=True)
    icon_url = models.CharField(max_length=500, null=True, blank=True)
    main_image_url = models.CharField(max_length=500, null=True, blank=True)
    download_url = models.CharField(max_length=500, null=True, blank=True)
    download_files = models.JSONField(default=list)
    live_url = models.CharField(max_length=500, null=True, blank=True)
    support_url = models.CharField(max_length=500, null=True, blank=True)
    privacy_url = models.CharField(max_length=500, null=True, blank=True)
    version = models.CharField(max_length=80, null=True, blank=True)
    latest_release_at = models.DateTimeField(null=True, blank=True)
    features = models.JSONField(default=list)
    screenshots = models.JSONField(default=list)
    requirements = models.JSONField(default=dict)
    changelog = models.JSONField(default=list)
    seo_title_ar = models.CharField(max_length=255, null=True, blank=True)
    seo_title_en = models.CharField(max_length=255, null=True, blank=True)
    seo_description_ar = models.CharField(max_length=500, null=True, blank=True)
    seo_description_en = models.CharField(max_length=500, null=True, blank=True)
    sort_order = models.IntegerField(default=0, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    extra_data = models.JSONField(default=dict)

    class Meta:
        db_table = "software_apps"
        ordering = ["sort_order", "-created_at"]


class PortfolioProject(SoftDeleteModel):
    title_ar = models.CharField(max_length=180)
    title_en = models.CharField(max_length=180)
    slug_ar = models.CharField(max_length=220, unique=True, db_index=True)
    slug_en = models.CharField(max_length=220, unique=True, db_index=True)
    description_ar = models.TextField()
    description_en = models.TextField()
    full_description_ar = models.TextField(null=True, blank=True)
    full_description_en = models.TextField(null=True, blank=True)
    problem_ar = models.TextField(null=True, blank=True)
    problem_en = models.TextField(null=True, blank=True)
    result_ar = models.TextField(null=True, blank=True)
    result_en = models.TextField(null=True, blank=True)
    category_ar = models.CharField(max_length=120, null=True, blank=True, db_index=True)
    category_en = models.CharField(max_length=120, null=True, blank=True, db_index=True)
    technologies = models.JSONField(default=list)
    gallery_images = models.JSONField(default=list)
    main_image_url = models.CharField(max_length=500, null=True, blank=True)
    preview_url = models.CharField(max_length=500, null=True, blank=True)
    completed_at = models.DateField(null=True, blank=True)
    seo_title_ar = models.CharField(max_length=255, null=True, blank=True)
    seo_title_en = models.CharField(max_length=255, null=True, blank=True)
    seo_description_ar = models.CharField(max_length=500, null=True, blank=True)
    seo_description_en = models.CharField(max_length=500, null=True, blank=True)
    sort_order = models.IntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    extra_data = models.JSONField(default=dict)

    class Meta:
        db_table = "portfolio_projects"
        ordering = ["sort_order", "-created_at"]


class BlogCategory(SoftDeleteModel):
    name_ar = models.CharField(max_length=160)
    name_en = models.CharField(max_length=160)
    slug_ar = models.CharField(max_length=220, unique=True, db_index=True)
    slug_en = models.CharField(max_length=220, unique=True, db_index=True)
    description_ar = models.TextField(null=True, blank=True)
    description_en = models.TextField(null=True, blank=True)
    sort_order = models.IntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = "blog_categories"
        ordering = ["sort_order", "-created_at"]


class BlogPost(SoftDeleteModel):
    category_id = models.ForeignKey(BlogCategory, on_delete=models.SET_NULL, null=True, blank=True, db_column="category_id", related_name="posts")
    author_id = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_column="author_id", related_name="blog_posts")
    title_ar = models.CharField(max_length=220)
    title_en = models.CharField(max_length=220)
    slug_ar = models.CharField(max_length=260, unique=True, db_index=True)
    slug_en = models.CharField(max_length=260, unique=True, db_index=True)
    excerpt_ar = models.TextField(null=True, blank=True)
    excerpt_en = models.TextField(null=True, blank=True)
    content_ar = models.TextField()
    content_en = models.TextField()
    featured_image_url = models.CharField(max_length=500, null=True, blank=True)
    seo_title_ar = models.CharField(max_length=255, null=True, blank=True)
    seo_title_en = models.CharField(max_length=255, null=True, blank=True)
    seo_description_ar = models.CharField(max_length=500, null=True, blank=True)
    seo_description_en = models.CharField(max_length=500, null=True, blank=True)
    status = models.CharField(max_length=40, choices=PublishStatus.choices, default=PublishStatus.DRAFT, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True)
    views_count = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    sort_order = models.IntegerField(default=0)
    tags = models.JSONField(default=list)

    class Meta:
        db_table = "blog_posts"
        ordering = ["-published_at", "-created_at"]


class Faq(SoftDeleteModel):
    scope = models.CharField(max_length=40, choices=FaqScope.choices, default=FaqScope.GENERAL, db_index=True)
    service_id = models.ForeignKey(Service, on_delete=models.CASCADE, null=True, blank=True, db_column="service_id", related_name="faqs")
    product_id = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True, db_column="product_id", related_name="general_faqs")
    question_ar = models.TextField()
    question_en = models.TextField()
    answer_ar = models.TextField()
    answer_en = models.TextField()
    sort_order = models.IntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = "faqs"
        ordering = ["sort_order", "-created_at"]


class Testimonial(SoftDeleteModel):
    client_name = models.CharField(max_length=160)
    company_name = models.CharField(max_length=160, null=True, blank=True)
    position = models.CharField(max_length=160, null=True, blank=True)
    text_ar = models.TextField()
    text_en = models.TextField()
    rating = models.IntegerField(default=5)
    image_url = models.CharField(max_length=500, null=True, blank=True)
    sort_order = models.IntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = "testimonials"
        ordering = ["sort_order", "-created_at"]


class StaticPage(SoftDeleteModel):
    page_key = models.CharField(max_length=120, unique=True, db_index=True)
    title_ar = models.CharField(max_length=220)
    title_en = models.CharField(max_length=220)
    slug_ar = models.CharField(max_length=260, unique=True, db_index=True)
    slug_en = models.CharField(max_length=260, unique=True, db_index=True)
    content_ar = models.TextField(null=True, blank=True)
    content_en = models.TextField(null=True, blank=True)
    sections = models.JSONField(default=dict)
    seo_title_ar = models.CharField(max_length=255, null=True, blank=True)
    seo_title_en = models.CharField(max_length=255, null=True, blank=True)
    seo_description_ar = models.CharField(max_length=500, null=True, blank=True)
    seo_description_en = models.CharField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = "static_pages"
        ordering = ["page_key"]


class QuoteRequest(SoftDeleteModel):
    full_name = models.CharField(max_length=160)
    phone = models.CharField(max_length=40)
    email = models.EmailField(max_length=255, null=True, blank=True, db_index=True)
    project_type = models.CharField(max_length=40, choices=ProjectType.choices, default=ProjectType.OTHER, db_index=True)
    expected_budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    expected_duration = models.CharField(max_length=120, null=True, blank=True)
    description = models.TextField()
    attachment_url = models.CharField(max_length=500, null=True, blank=True)
    preferred_contact_method = models.CharField(max_length=40, choices=PreferredContactMethod.choices, default=PreferredContactMethod.WHATSAPP)
    status = models.CharField(max_length=40, choices=QuoteStatus.choices, default=QuoteStatus.NEW, db_index=True)
    priority = models.CharField(max_length=40, choices=QuotePriority.choices, default=QuotePriority.NORMAL, db_index=True)
    source = models.CharField(max_length=120, null=True, blank=True)
    assigned_to_id = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_column="assigned_to_id", related_name="assigned_quote_requests")
    follow_up_at = models.DateTimeField(null=True, blank=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    internal_data = models.JSONField(default=dict)

    class Meta:
        db_table = "quote_requests"
        ordering = ["-created_at"]


class QuoteRequestNote(UUIDTimestampModel):
    quote_request_id = models.ForeignKey(QuoteRequest, on_delete=models.CASCADE, db_column="quote_request_id", related_name="notes")
    user_id = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_column="user_id", related_name="quote_notes")
    note = models.TextField()
    is_system = models.BooleanField(default=False)

    class Meta:
        db_table = "quote_request_notes"
        ordering = ["created_at"]


class ContactMessage(SoftDeleteModel):
    full_name = models.CharField(max_length=160)
    phone = models.CharField(max_length=40, null=True, blank=True)
    email = models.EmailField(max_length=255, null=True, blank=True, db_index=True)
    subject = models.CharField(max_length=255, null=True, blank=True)
    message = models.TextField()
    status = models.CharField(max_length=40, choices=ContactMessageStatus.choices, default=ContactMessageStatus.NEW, db_index=True)
    internal_note = models.TextField(null=True, blank=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.CharField(max_length=80, null=True, blank=True)
    user_agent = models.CharField(max_length=500, null=True, blank=True)

    class Meta:
        db_table = "contact_messages"
        ordering = ["-created_at"]


class SupportRequest(SoftDeleteModel):
    full_name = models.CharField(max_length=160)
    phone = models.CharField(max_length=40, null=True, blank=True)
    email = models.EmailField(max_length=255, null=True, blank=True, db_index=True)
    app_id = models.ForeignKey(SoftwareApp, on_delete=models.SET_NULL, null=True, blank=True, db_column="app_id")
    app_name = models.CharField(max_length=180, null=True, blank=True)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=40, choices=SupportRequestStatus.choices, default=SupportRequestStatus.NEW, db_index=True)
    priority = models.CharField(max_length=40, choices=QuotePriority.choices, default=QuotePriority.NORMAL, db_index=True)
    internal_note = models.TextField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.CharField(max_length=80, null=True, blank=True)
    user_agent = models.CharField(max_length=500, null=True, blank=True)
    extra_data = models.JSONField(default=dict)

    class Meta:
        db_table = "support_requests"
        ordering = ["-created_at"]


class MediaFile(SoftDeleteModel):
    uploaded_by_id = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_column="uploaded_by_id", related_name="uploaded_media_files")
    file_name = models.CharField(max_length=255, db_index=True)
    original_name = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=120, db_index=True)
    media_type = models.CharField(max_length=40, choices=MediaType.choices, default=MediaType.OTHER, db_index=True)
    file_size = models.IntegerField()
    url = models.CharField(max_length=500)
    storage_path = models.CharField(max_length=500)
    alt_text_ar = models.CharField(max_length=255, null=True, blank=True)
    alt_text_en = models.CharField(max_length=255, null=True, blank=True)
    usage_count = models.IntegerField(default=0)
    is_used = models.BooleanField(default=False)
    extra_data = models.JSONField(default=dict)

    class Meta:
        db_table = "media_files"
        ordering = ["-created_at"]


class AdminNotification(UUIDTimestampModel):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, db_column="user_id", related_name="notifications")
    notification_type = models.CharField(max_length=40, choices=NotificationType.choices, default=NotificationType.SYSTEM, db_index=True)
    title_ar = models.CharField(max_length=220)
    title_en = models.CharField(max_length=220)
    body_ar = models.TextField(null=True, blank=True)
    body_en = models.TextField(null=True, blank=True)
    target_type = models.CharField(max_length=120, null=True, blank=True, db_index=True)
    target_id = models.CharField(max_length=120, null=True, blank=True, db_index=True)
    action_url = models.CharField(max_length=500, null=True, blank=True)
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    extra_data = models.JSONField(default=dict)

    class Meta:
        db_table = "admin_notifications"
        ordering = ["-created_at"]


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_index=True)
    user_id = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_column="user_id", related_name="audit_logs")
    action = models.CharField(max_length=40, choices=AuditAction.choices, db_index=True)
    entity_type = models.CharField(max_length=120, null=True, blank=True, db_index=True)
    entity_id = models.CharField(max_length=120, null=True, blank=True, db_index=True)
    description = models.TextField()
    before_data = models.JSONField(null=True, blank=True)
    after_data = models.JSONField(null=True, blank=True)
    ip_address = models.CharField(max_length=80, null=True, blank=True)
    user_agent = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        db_table = "audit_logs"
        ordering = ["-created_at"]


class AnalyticsEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_index=True)
    event_type = models.CharField(max_length=40, choices=AnalyticsEventType.choices, default=AnalyticsEventType.PAGE_VIEW, db_index=True)
    path = models.CharField(max_length=500, null=True, blank=True, db_index=True)
    locale = models.CharField(max_length=10, null=True, blank=True, db_index=True)
    entity_type = models.CharField(max_length=120, null=True, blank=True, db_index=True)
    entity_id = models.CharField(max_length=120, null=True, blank=True, db_index=True)
    referrer = models.CharField(max_length=500, null=True, blank=True)
    ip_address = models.CharField(max_length=80, null=True, blank=True)
    user_agent = models.CharField(max_length=500, null=True, blank=True)
    extra_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        db_table = "analytics_events"
        ordering = ["-created_at"]


class EmailTemplate(UUIDTimestampModel):
    key = models.CharField(max_length=120, unique=True, db_index=True)
    subject_ar = models.CharField(max_length=255)
    subject_en = models.CharField(max_length=255)
    body_ar = models.TextField()
    body_en = models.TextField()
    variables = models.JSONField(default=list)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = "email_templates"
        ordering = ["key"]