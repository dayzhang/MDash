# -*- coding: utf-8 -*-

import csv
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import random
from statsmodels.distributions.empirical_distribution import ECDF
import scipy.stats as st
import json
import sys

n = len(sys.argv)
if n != 4:
  exit("takes 3 arguments, the music, first trace, and second trace")
music_title = sys.argv[1]
trace_1 = sys.argv[2]
trace_2 = sys.argv[3]

def probability_comparison(music_title, trace_1, trace_2):

    file_1 = f"../app-handler/music_data/{trace_1}.txt"
    file_2 = f"../app-handler/music_data/{trace_2}.txt"
    swipe_timings1 = []
    swipe_timings2 = []
    with open(file_1, "r") as f:
        swipe_json = json.load(f)
        # 10 because every trace had a start time of about 10 seconds
        swipe_stime = swipe_json[0]["_time"]
        prevtime = swipe_stime
        # ideally len(swipe_timing) == the number of videos watched,
        # but prebuffering might eat inputs on cases with repeated fast swipes

        n = len(swipe_json) - 2
        # had 2 sentinel values in json
        for i in range(2, n - 1, 2):
            swipe_timings1.append(swipe_json[i]["_time"] - prevtime)
            prevtime = swipe_json[i]["_time"]
    with open(file_2, "r") as f:
        swipe_json = json.load(f)
        # 10 because every trace had a start time of about 10 seconds
        swipe_stime = swipe_json[0]["_time"]
        prevtime = swipe_stime
        # ideally len(swipe_timing) == the number of videos watched,
        # but prebuffering might eat inputs on cases with repeated fast swipes

        n = len(swipe_json) - 2
        # had 2 sentinel values in json
        for i in range(2, n - 1, 2):
            swipe_timings2.append(swipe_json[i]["_time"] - prevtime)
            prevtime = swipe_json[i]["_time"]
    print(swipe_timings1, swipe_timings2)
    bins = np.linspace(0, 30, 7)
    plt.hist([swipe_timings1, swipe_timings2], bins, label=["p1", "p2"], density=True)
    plt.xlabel("Swipe Time (s)")
    plt.ylabel("Frequency")
    plt.legend(loc="upper right")
    plt.title(f"{music_title} Comparison")
  
  
    plt.savefig(f"../app-handler/music_data/{music_title}.png")
    plt.show()




probability_comparison(sys.argv[1], sys.argv[2], sys.argv[3])