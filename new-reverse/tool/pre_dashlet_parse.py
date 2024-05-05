import json
import sys
import os
import shutil

class Datalogger:
    def __init__(self):
        # log the playing sequence
        self.last_video_id = None

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
        
    

    def response(self, flow):
        
        # print(list(flow.response.headers.keys()))
        # print(flow)
        content_type = ""
        if 'Content-Type' not in flow.response.headers.keys():
            if 'content-type' not in flow.response.headers.keys():
                return
            content_type = flow.response.headers['content-type']
        content_type =  flow.response.headers['Content-Type']
        # print(flow.response.headers)

        # prevent policy notice from popping up
        if (flow.request.path.find("/policy/notice/") != -1):
            flow.response.content = b""

         


        # print(content_type)


        if str(content_type) == "text/html; charset=utf-8":
            self.last_video_id = flow.request.url.split("/")[-1]

        if str(content_type) == "application/json; charset=utf-8":
            if "https://www.tiktok.com/api/music/detail" in flow.request.url:
                # print(flow.request.headers, "headers")
                # print(flow.request.query, "query")
                if self.last_video_id is None:
                    print("MUSIC WITH NO VIDEO ERROR")
                    return
                f = f"../../abr-server/probability/{self.last_video_id}.txt"
                music = flow.request.query['musicId']
                new_file_path = f"dashlet_music_data/{music}" 
                if not os.path.exists(new_file_path): 
                    os.makedirs(new_file_path) 
                shutil.copyfile(f, f"{new_file_path}/{self.last_video_id}.txt")
                self.last_video_id = None
                    



            



addons = [
    Datalogger()
]