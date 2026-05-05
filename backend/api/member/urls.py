from django.urls import path
from . import views


urlpatterns = [
    # Your existing URLs
    path('request/', views.MembershipRequest.as_view(), name='membership_request'),
    path('pending/', views.PendingMemberships.as_view(), name='get_pending_memberships'),
    path('approved/', views.ApprovedMemberships.as_view(), name='get_approved_memberships'),
    path('add-Approved-member/', views.AddApprovedMember.as_view(), name='add-approve_membership'),
    path('approve/<int:member_id>/', views.ApproveMembership.as_view(), name='approve_membership'),
    path('reject/<int:member_id>/', views.RejectMembership.as_view(), name='reject_membership'),
    path('api/auth/first-login/', views.FirstLoginActivation.as_view(), name='first_login_activation'),
    path('update/<int:member_id>/',views.update.as_view(), name='edit-member'),    
]