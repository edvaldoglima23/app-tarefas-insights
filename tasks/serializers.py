from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'created_at', 'user']
        read_only_fields = ['id', 'created_at', 'user']

class TaskUpdateSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Task
        fields = ['title', 'description', 'status']
        extra_kwargs = {
            'title': {'required': False},
            'description': {'required': False},
            'status': {'required': False}
        }