from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader
from django.shortcuts import render, redirect
from .models import Profile, User, Comment
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.shortcuts import render, get_object_or_404
from django.contrib import messages
import json
from django.template.loader import render_to_string

from .forms import CommentForm
import timeit

def index(request):
    loaded_game = {}
    display_badge = "images/stage1.jpg"
    # get player profile from model only if logged in
    if request.user.username != '':

        start_time = timeit.default_timer()
        user_profile = Profile.objects.get(user = request.user)
        total_time = timeit.default_timer() - start_time
        print("Time to Retrieve User Profile: ", total_time)
        # SAVE GAME
        if request.method == 'POST':
            # parse JSON file
            game_save = request.POST.get('gameSaveField')
            game_save_parsed = json.loads(game_save)
            # save game variables to user profile in model
            user_profile.season_clicks = game_save_parsed["score"]
            user_profile.lifetime_clicks = game_save_parsed["totalScore"]
            user_profile.mouse_clicks = game_save_parsed["totalClicks"]
            user_profile.click_value = game_save_parsed["clickValue"]
            user_profile.pwr_1 = game_save_parsed["powerupCount"][0]
            user_profile.pwr_2 = game_save_parsed["powerupCount"][1]
            user_profile.pwr_3 = game_save_parsed["powerupCount"][2]
            user_profile.upgrade_1 = game_save_parsed["upgradePurchased"][0]
            user_profile.upgrade_2 = game_save_parsed["upgradePurchased"][1]
            user_profile.upgrade_3 = game_save_parsed["upgradePurchased"][2]
            user_profile.save()

        # LOAD GAME
        loaded_game = {
            "score": user_profile.season_clicks,
            "totalScore": user_profile.lifetime_clicks,
            "totalClicks": user_profile.mouse_clicks,
            "clickValue": user_profile.click_value,
            "powerupCount": [user_profile.pwr_1, user_profile.pwr_2, user_profile.pwr_3], 
            "upgradePurchased": [user_profile.upgrade_1, user_profile.upgrade_2, user_profile.upgrade_3],
        }

        # LOAD CORRECT BADGE USING FACTORY PATTERN
        #start_time = timeit.default_timer()
        factory = BadgeFactory()#time test
        display_badge = factory.getBadge(user_profile.lifetime_clicks).file
        #total_time = timeit.default_timer() - start_time

        #print("Time for the factory pattern to work:", total_time)

    # POPULATE LEADERBOARD
    top_scores = Profile.objects.order_by('-season_clicks')[:5]

    # POPULATE MINI CHAT (5 most recent msgs)
    latest_chat_list = Comment.objects.order_by('-publish_datetime')[:5]
    latest_chat_list = reversed(latest_chat_list)

    template = loader.get_template('clicker/index.html')
    context = {'top_scores': top_scores, 'loaded_game': loaded_game, 'latest_chat_list': latest_chat_list, 'display_badge': display_badge}
    return HttpResponse(template.render(context, request))

@login_required
def chat(request):
    start_time = timeit.default_timer()
    latest_chat_list = Comment.objects.order_by('-publish_datetime')[:20]
    total_time = timeit.default_timer() - start_time
    print("Time to Retrieve the Comment list: ", total_time)

    latest_chat_list = reversed(latest_chat_list)
    if request.method == 'POST':
        comment_form = CommentForm(request.POST, instance=request.user)
        
        if comment_form.is_valid():
            comment_form.save()
            start_time = timeit.default_timer()
            comment = Comment.objects.create(user = request.user, content = comment_form.cleaned_data['content'])#time test
            total_time = timeit.default_timer() - start_time
            print("Time to post a new comment: ", total_time)

            messages.success(request, 'Your comment has been posted')
            return redirect(to='chat')
    else:
        comment_form = CommentForm(instance=request.user)
        if comment_form.is_valid():
            comment = Comment.objects.create(user = request.user, content = comment_form.cleaned_data['content'])
            comment_form.save()
            messages.success(request, 'Your comment has been posted')
            return redirect(to='chat')

    return render(request, 'chat.html', {'comment_form': comment_form, 'latest_chat_list': latest_chat_list})

# FACTORY PATTERN
class NewBadge:
    def create(self, clicks):
        factory = BadgeFactory()
        displaybadge = factory.getBadge(clicks)
        return displaybadge

class BadgeFactory:
    def __init__(self):
        self.badge = Badge()
    def getBadge(self, clicks):
        if clicks <= 10:
            self.badge = Stage1Badge()
            return self.badge

        elif clicks <= 50:
            self.badge = Stage2Badge()
            return self.badge

        elif clicks <= 100:
            self.badge = Stage3Badge()
            return self.badge

        elif clicks <= 200:
            self.badge = Stage4Badge()
            return self.badge

        elif clicks <= 350:
            self.badge = Stage5Badge()
            return self.badge
            
        elif clicks <= 500:
            self.badge = Stage6Badge()
            return self.badge
        
        else:
            self.badge = Stage7Badge()
            return self.badge

#Abstract Badge class (empty filepath)
class Badge:
    def __init__(self):
        self.file = ""

class Stage1Badge(Badge):
    def __init__(self):
        self.file = "images/stage1.jpg"

class Stage2Badge(Badge):
    def __init__(self):
        self.file = "images/stage2.jpg"

class Stage3Badge(Badge):
    def __init__(self):
        self.file = "images/stage3.png"

class Stage4Badge(Badge):
    def __init__(self):
        self.file = "images/stage4.png"

class Stage5Badge(Badge):
    def __init__(self):
        self.file = "images/stage5.jpg"

class Stage6Badge(Badge):
    def __init__(self):
        self.file = "images/stage6.png"

class Stage7Badge(Badge):
    def __init__(self):
        self.file = "images/stage7.png"
