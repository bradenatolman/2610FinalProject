from django.db import models
from django.db.models import SET
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator

# Helper functions
def get_uncategorized_cat(deleted_category):
    if deleted_category is None:
        return None
    cat, _ = Category.objects.get_or_create(
        user=deleted_category.user,
        name="Uncategorized",
        defaults={"rank": 9999, "color": "#FFFFFF"},
    )
    return cat


def get_uncategorized_sub(deleted_subcategory):
    if deleted_subcategory is None:
        return None
    sub, _ = SubCategory.objects.get_or_create(
        category=deleted_subcategory.category,
        name="Uncategorized"
    )
    return sub





class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    color = models.CharField(max_length=7, default="#FFFFFF")  # Hex color code
    rank = models.IntegerField(default=0)

    class Meta:
        # unique per user
        unique_together = ("user", "name")

    def __str__(self):
        return f"{self.user} → {self.name}"


class SubCategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.SET(get_uncategorized_cat))
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ("category", "name")

    def __str__(self):
        return f"{self.category} → {self.name}"


class Month(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    year = models.IntegerField()
    month = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)]
    )
    total_budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        unique_together = ("user", "year", "month")
        ordering = ["year", "month"]

    def __str__(self):
        return f"{self.month}/{self.year} — Budget: {self.total_budget}"


class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    month = models.ForeignKey(Month, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=SET(get_uncategorized_cat))
    subcategory = models.ForeignKey(SubCategory, null=True, blank=True, on_delete=models.SET(get_uncategorized_sub))
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def clean(self):
        # Ensure subcategory belongs to category (if subcategory set)
        if self.subcategory and self.subcategory.category != self.category:
            raise ValidationError("SubCategory must belong to the same Category.")

    def __str__(self):
        if self.subcategory:
            return f"{self.category} / {self.subcategory}: {self.budget}"
        return f"{self.category}: {self.budget}"


class Purchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.CharField(max_length=200)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def clean(self):
        if hasattr(self, "subcategories") and hasattr(self, "categories"):
            for sub in self.subcategories.all():
                if sub.category not in self.categories.all():
                    raise ValidationError(
                        f"Subcategory '{sub}' does not belong to any selected category."
                    )

    def __str__(self):
        cats = ", ".join([c.name for c in getattr(self, "categories").all()]) if hasattr(self, "categories") else ""
        subs = ", ".join([s.name for s in getattr(self, "subcategories").all()]) if hasattr(self, "subcategories") else ""
        return f"{cats} — {subs}: {self.total} on {self.date}"


class PurchaseItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET(get_uncategorized_cat))
    subcategory = models.ForeignKey(SubCategory, null=True, blank=True, on_delete=models.SET(get_uncategorized_sub))
    amount = models.DecimalField(max_digits=12, decimal_places=2)
