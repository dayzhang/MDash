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
if n != 3:
  print("takes 2 arguments, the experiment_name and cleaned_name")

def experiment_plot(experiment_name, cleaned_name):

  download_file = f"../data/{experiment_name}/{experiment_name}-download.csv"
  play_file = f"../data/{experiment_name}/{experiment_name}-play.csv"
  trace_file = f"../app-handler/data/{experiment_name}.txt"
  if experiment_name[-4:] == "2016" or experiment_name[-4:] == "6045":
    trace_file = f"../app-handler/data/{experiment_name[:-4]}.txt"
  # note, uri field does not refer to uri, refers to portion of url
  # used to identify video by url
  url_chunks = {}
  stime = None
  item_list_timings = []
  item_list_sizes = []
  plt.figure(figsize=(12, 9))
  item_list_indices = []
  gear_dict = {'adapt_lowest_1080_1': 0,
               'adapt_lower_720_1': 1,
               'normal_540_0': 2,
               'adapt_540_1': 3,
               'lower_540_0': 4,
               'lowest_540_0': 5,
               'normal_720_0': 6,
               'normal_480_0': 7}
  colors = ["orangered",
"darkorange",
"gold",
"yellowgreen",
"darkolivegreen",
"lightseagreen",
"dodgerblue",
"midnightblue",
"mediumorchid",
"tomato"]
  # print(colors)
  SEQNUM_IDX = 0
  BITRATE_IDX = 1
  GEAR_NAME_IDX = 2
  QUALITY_TYPE_IDX = 3
  with open(play_file, newline='') as play:
    spam_reader = csv.DictReader(play)
    for row in spam_reader:

      seq_num = int(row["seqnum"])
      current_chunks = row["url_chunk_string"].split("&")
      bitrates = row["bitrate_string"].split("&")
      gear_names = row["gear_name_string"].split("&")
      quality_types = row["quality_type_string"].split("&")
      for i in range(len(current_chunks)):
        url_chunks[current_chunks[i]] = [seq_num,
                                         int(bitrates[i]),
                                         gear_names[i],
                                         quality_types[i]]
      request_time_start = float(row["request_time_start"])
      request_time_stop = float(row["request_time_stop"])
      response_time_start = float(row["response_time_start"])
      response_time_stop = float(row["response_time_stop"])
      if stime is None:
        stime = request_time_start
        item_list_timings.append(request_time_start - stime)
        item_list_sizes.append(1)

      elif abs(request_time_start - stime - item_list_timings[-1]) > 0.0001:
        item_list_timings.append(request_time_start - stime)
        item_list_sizes.append(1)
      else:
        item_list_sizes[-1] += 1
    total = 0
  # print(item_list_timings, item_list_sizes)
  plt.scatter(item_list_timings, item_list_sizes)
  plt.xlabel("Time (seconds)")
  plt.ylabel("Number of videos per manifest file")
  plt.xlim(0, 325)
  plt.ylim(0, None)
  plt.title(f"{cleaned_name} Manifest Loads")
  # 
  plt.savefig(f"../data/{experiment_name}/{experiment_name}_manifest.png")
  plt.show()
  plt.figure(figsize=(12, 9))
  for i, size in enumerate(item_list_sizes):
      total += size
      item_list_indices += size * [i]
      if i == 0:
          plt.axhline(y=total, color="black", label="manifest file bounds")
      else:
          plt.axhline(y=total, color="black")
  download_timings = [[] for i in range(len(gear_dict))]
  download_url_chunks = []
  download_seq_nums = [[] for i in range(len(gear_dict))]

  with open(download_file, newline='') as download:

      spam_reader = csv.DictReader(download, \
                                  fieldnames=[
                                      "content-type",
                                      "content-range",
                                      "request-start",
                                      "request-end",
                                      "response-start",
                                      "response-end",
                                      "dump",
                                      "video",
                                      "url"])

      for row in spam_reader:
          # print(row)
          url_chunk = row["url"].split('/')[5]
          if url_chunk not in url_chunks:
            # print(float(row["request-start"]) - stime)

            continue
          gear_name = url_chunks[url_chunk][GEAR_NAME_IDX]
          # content_range = row["content-range"].split()[1]
          # print(gear_dict[gear_name])
          download_timings[gear_dict[gear_name]].append(float(row["request-start"]) - stime)
          download_url_chunks.append(url_chunk)
          download_seq_nums[gear_dict[gear_name]].append(url_chunks[url_chunk][0])

      # print(len(download_timings))
  # print(download_seq_nums)
  # print([colors[item_list_indices[s]] for s in download_seq_nums])
  for i in range(len(gear_dict)):
      if (len(download_timings[i])):
          plt.scatter(download_timings[i],
                      download_seq_nums[i],
                      c=colors[i],
                      label=list(gear_dict.keys())[i],
                      s=20)
  plt.xlabel("Time (seconds)")
  plt.ylabel("Index of video downloaded")
  swipe_stime = None
  swipe_timings = []
  with open(trace_file) as trace_json:
    swipe_json = json.load(trace_json)
    # 10 because every trace had a start time of about 10 seconds
    swipe_stime = swipe_json[0]["_time"] - 10

    # ideally len(swipe_timing) == the number of videos watched,
    # but prebuffering might eat inputs on cases with repeated fast swipes

    n = len(swipe_json) - 2
    # had 2 sentinel values in json
    for i in range(0, n - 1, 2):
      swipe_timings.append(swipe_json[i]["_time"] - swipe_stime)
      if i == 0:
          plt.axvline(x=swipe_timings[-1],
                      color="lightblue",
                      linestyle='dotted',
                      linewidth=2,
                      label="swipe_timing")
      else:
          plt.axvline(x=swipe_timings[-1],
                      color="lightblue",
                      linestyle='dotted',
                      linewidth=2)
  plt.legend()
  plt.title(f"{cleaned_name} Chunk Loads")
  
  # 
  
  plt.savefig(f"../data/{experiment_name}/{experiment_name}_chunks.png")
  plt.show()




experiment_plot(sys.argv[1], sys.argv[2])