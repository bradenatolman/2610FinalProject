from django.db import models
from django.core.exceptions import ValidationError


# Category + SubCategory

class Category(models.Model):
    category = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.category


class SubCategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    subcategory = models.CharField(max_length=100)

    class Meta:
        unique_together = ("category", "subcategory")

    def __str__(self):
        return f"{self.category} → {self.subcategory}"



# Receipt

class Receipt(models.Model):
    file = models.FileField(upload_to="receipts/", null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Receipt {self.id} uploaded {self.uploaded_at}"



# Month (Budget per month)

class Month(models.Model):
    year = models.IntegerField()
    month = models.IntegerField()  # 1–12
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        unique_together = ("year", "month")
        ordering = ["year", "month"]

    def __str__(self):
        return f"{self.month}/{self.year} — Budget: {self.budget}"



# Category/SubCategory Budgeting

class Budget(models.Model):
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
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    subcategory = models.ForeignKey(SubCategory, on_delete=models.SET_NULL, null=True, blank=True)
    spent = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    receipt = models.ForeignKey(Receipt, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def clean(self):
        if self.subcategory and self.subcategory.category != self.category:
            raise ValidationError(
                "SubCategory must belong to the same Category."
            )

    def __str__(self):
        return f"{self.category} - {self.subcategory}: {self.spent} on {self.date}"
