import json
import sys
import os
class Datalogger:
    def __init__(self):
        # log the playing sequence
        with open("../config.json") as fd:

            configurations = json.load(fd)

            exp_name = configurations["exp_name"]

            new_directory = f"../data/{exp_name}"
            
            if not os.path.exists(new_directory):
                os.makedirs(new_directory)

            self.play_fd = open(f"../data/{exp_name}/{exp_name}-play.csv", "w")

            self.download_fd = open(f"../data/{exp_name}/{exp_name}-download.csv", "w")

            self.seqnum = 0

            self.total = configurations['iterations']
            self.play_fd.write("seqnum,url_chunk,duration,bitrate_string,url_chunk_string,download_addr,gear_name_string,")
            self.play_fd.write("quality_type_string,request_time_start,request_time_start,response_time_start,response_time_stop\n")

            self.play_fd.flush()

    def parse_json(self, data, flow):
        # 
        print(type(data))
        if (type(data) != type({})):
            
            print("not dict")
            return
        if 'itemList' not in data.keys():
            return
        print(data.keys())
        print(type(data))
        lists = data['itemList']
        print('lists found')
        
            
        for i in range(len(lists)):

            # if type(lists) is not list:
            #     continue

            # if 'aweme_info' not in lists[i].keys():
            #     continue

            # video_entry = lists[i]['aweme_info']['video']
            # video_entry = lists[i]['video']['downloadAddr']
            

            # print(video_entry['duration'])
            # print(video_entry['play_addr']['uri'])
            # print(len(video_entry['bit_rate']))

            bit_rates = []
            uri_hash = []
            gear_names = []
            quality_types = []

            bitrate_info = lists[i]['video']['bitrateInfo']
            used_bitrate = lists[i]['video']['bitrate']
            print(f"used_bitrate: {used_bitrate}")
            download_addr = ""
            uri = ""
            for j in range(len(bitrate_info)):
                
                bit_rates.append(str(bitrate_info[j]['Bitrate']))
                gear_names.append(str(bitrate_info[j]['GearName']))
                quality_types.append(str(bitrate_info[j]['QualityType']))

                url0 = bitrate_info[j]['PlayAddr']['UrlList'][0]
                
                entries = url0.split('/')
                uri_hash.append(entries[7])
                
                if int(bit_rates[-1]) == used_bitrate:
                    download_addr = url0
                    uri = uri_hash[-1]
            
            # if len(bit_rates) > 0:
            #     download_addr = bitrate_info[0]['play_addr']['url_list'][0]

            bit_rate_string = "&".join(bit_rates)
            uri_hash_string = "&".join(uri_hash)
            gear_name_string = "&".join(gear_names)
            quality_type_string = "&".join(quality_types)
            
            # print(bit_rate_string)
            # print(uri_hash_string)
            # print('prints should be happening')
            self.play_fd.write(str(self.seqnum))
            self.play_fd.write(",")
            self.play_fd.write(uri)
            self.play_fd.write(",")
            self.play_fd.write(str(lists[i]['video']['duration']))
            self.play_fd.write(",")
            self.play_fd.write(bit_rate_string)
            self.play_fd.write(",")
            self.play_fd.write(uri_hash_string)
            self.play_fd.write(",")
            self.play_fd.write(download_addr)
            self.play_fd.write(",")
            self.play_fd.write(gear_name_string)
            self.play_fd.write(",")
            self.play_fd.write(quality_type_string)
            self.play_fd.write(", ")


            self.play_fd.write(str(flow.request.timestamp_start))
            self.play_fd.write(",")

            self.play_fd.write(str(flow.request.timestamp_end))
            self.play_fd.write(",")

            self.play_fd.write(str(flow.response.timestamp_start))
            self.play_fd.write(",")

            self.play_fd.write(str(flow.response.timestamp_end))
            self.play_fd.write("\n")

            self.play_fd.flush()

            self.seqnum += 1
        print('finished')
        
    def log_play_seq(self, flow):
        print(f'log entered {len(str(flow.response.content))}')
        # print(flow.response.content.decode('utf-8'))

        if len(str(flow.response.content)) > 5000:
            print('wtf')
            jstr = flow.response.content.decode("utf-8")

            data = json.loads(jstr)
            self.parse_json(data, flow)
            print('done')



    def log_download_seq(self, flow, content_type):
        print("download entered")

        self.download_fd.write(str(content_type))
        self.download_fd.write(",")

        if ('Accept-Ranges' in flow.response.headers):
            self.download_fd.write(str(flow.response.headers['Accept-Ranges']))

        if ('Content-Range' in flow.response.headers):
            self.download_fd.write(str(flow.response.headers['Content-Range']))
        self.download_fd.write(",")

        # print(b'Content-Range' in flow.response.headers)

        self.download_fd.write(str(flow.request.timestamp_start))
        self.download_fd.write(",")
        

        self.download_fd.write(str(flow.request.timestamp_end))
        self.download_fd.write(",")


        self.download_fd.write(str(flow.response.timestamp_start))
        self.download_fd.write(",")


        self.download_fd.write(str(flow.response.timestamp_end))
        self.download_fd.write(",")


        # self.download_fd.write(str(flow.request.headers[b'Host']))
        self.download_fd.write("dump")
        self.download_fd.write(",")

        
        rpath = flow.request.path
        rtiems = rpath.split("/")

        self.download_fd.write(str(rtiems[1]))
        self.download_fd.write(",")

        self.download_fd.write(str(rpath))
        self.download_fd.write("\n")

        self.download_fd.flush()

    def response(self, flow):
        
        print('response happened')
        # print(list(flow.response.headers.keys()))
        # print(flow)
        content_type = ""
        if 'Content-Type' not in flow.response.headers.keys():
            if 'content-type' not in flow.response.headers.keys():
                return
            content_type = flow.response.headers['content-type']
        content_type =  flow.response.headers['Content-Type']
        print('wtf')
        # print(flow.response.headers)

        # prevent policy notice from popping up
        if (flow.request.path.find("/policy/notice/") != -1):
            flow.response.content = b""

         


        print(content_type)

        if str(content_type) == "application/json; charset=utf-8":
            self.log_play_seq(flow)

        if str(content_type) == "video/mp4":
            self.log_download_seq(flow, content_type)



addons = [
    Datalogger()
]