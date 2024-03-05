from django.shortcuts import render,HttpResponse

# Create your views here.
def index(request):
    print(f"Request from {request.user}")
    return render(request,'core/index.html')