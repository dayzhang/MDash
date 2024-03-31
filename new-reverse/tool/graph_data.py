import csv
import numpy as np
import matplotlib.pyplot as plt
import random
from statsmodels.distributions.empirical_distribution import ECDF
import scipy.stats as st
import json
import sys

n = len(sys.argv)

if n != 3:
    exit("Takes 2 arguments, name of folder in ../new-reverse/data/ reverse-tiktok/app-handler/data")