from django.shortcuts import render

# Create your views here.
def index(request,remote_user):
    print(remote_user)
    return render(request,'webRTC_conn/index.html')