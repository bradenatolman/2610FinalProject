from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator


# Category + SubCategory

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.category


class SubCategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ("category", "name")

    def __str__(self):
        return f"{self.category} → {self.name}"

# Month (Budget per month)

class Month(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    year = models.IntegerField()
    month = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)]
    )
    total_budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        unique_together = ("year", "month")
        ordering = ["year", "month"]

    def __str__(self):
        return f"{self.month}/{self.year} — Budget: {self.budget}"



# Category/SubCategory Budgeting

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    month = models.ForeignKey(Month, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    subcategory = models.ForeignKey(SubCategory, on_delete=models.CASCADE, null=True, blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2)

    def clean(self):
        # Ensure subcategory belongs to category
        if self.subcategory and self.subcategory.category != self.category:
            raise ValidationError(
                "SubCategory must belong to the same Category."
            )

    def __str__(self):
        if self.subcategory:
            return f"{self.category} / {self.subcategory}: {self.budget}"
        return f"{self.category}: {self.budget}"


# Purchase
class Purchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.CharField(max_length=200)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    pic = models.FileField(upload_to="receipts/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def clean(self):
        # Make sure every subcategory belongs to one of the selected categories
        for sub in self.subcategories.all():
            if sub.category not in self.categories.all():
                raise ValidationError(
                    f"Subcategory '{sub}' does not belong to any selected category."
                )

    def __str__(self):
        cats = ", ".join([c.name for c in self.categories.all()])
        subs = ", ".join([s.name for s in self.subcategories.all()])
        return f"{cats} — {subs}: {self.total} on {self.date}"


class purchaseItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    subcategory = models.ForeignKey(SubCategory, blank=True, null=True, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
