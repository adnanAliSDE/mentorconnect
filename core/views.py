from django.shortcuts import render,HttpResponse,redirect
from django.urls import reverse
from django.contrib.auth import login,authenticate,logout
from django.contrib.auth.decorators import login_required
from core.models import User

# Create your views here.
@login_required(login_url='core:login')
def index(request):
    print(f"Request from {request.user}")
    mentors=User.objects.all().exclude(username=request.user.username)
    context={
        "mentors":mentors
    }
    return render(request,'core/index.html',context)

def handle_login(request):
    if request.method=='POST':
        data=request.POST
        username=data.get('username').lower().strip()
        password=data.get('password').strip()
        user=authenticate(username=username,password=password)
        print(user)

        if user is not None:
            login(request,user)
            return redirect(reverse('core:home'))
        else:
            context={"msg":"Login Failed"}
            return render(request,'core/login.html',context)



    return render(request,'core/login.html')


@login_required(login_url='core:login')
def handle_logout(request):
    logout(request)
    return redirect(reverse('core:login'))

@login_required(login_url='core:login')
def videocall(request,remote_user=None):
    return render(request,'core/videocall.html')

@login_required(login_url='core:login')
def wait_for_call(request,remote_user=None):
    return render(request,'core/waitScreen.html')