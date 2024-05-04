import csv
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import random
from statsmodels.distributions.empirical_distribution import ECDF
import scipy.stats as st
import json
import sys
import os 

directory = "dashlet_music_data/6846028972107877126"
probs = []
num_buckets = 4
for filename in os.listdir(directory):

    with open(f"{directory}/{filename}", "r") as f:
        li = []
        current = 0
        bucket = 1
        lines = f.readlines()
        n = len(lines)
        for i in range(n):
            if i / n < bucket / num_buckets:
                current += float(lines[i])
                
            else:
                li.append(current)
                current = float(lines[i])
                bucket += 1
                print(bucket)
        li.append(current)
        probs.append(li)

X = ['Video 1','Video 2','Video 3','Video 4', 'Video 5', 'Video 6'] 
bar_width = 0.04
  
for i, dist in enumerate(probs):
    plt.bar(np.arange(num_buckets) * 1 / num_buckets + (i - 1) * bar_width, dist, label=f'Distribution {i}', width=bar_width)
  
plt.xticks(np.linspace(0, 1, num=num_buckets + 1)) 
plt.xlabel("Groups") 
plt.ylabel("Number of Students") 
plt.title("Number of Students in each group") 
plt.legend() 
plt.show() 