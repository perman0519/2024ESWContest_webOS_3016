#!/bin/bash

# 이미지 파일이 있는 디렉토리 경로
BASE_DIR="/media/multimedia/sector"

for sector in 0 1 2 3 4
do
    SECTOR_DIR="$BASE_DIR/$sector"

    if [ -d "$SECTOR_DIR" ]; then
        echo "섹터 $sector 폴더가 존재합니다"

        if [ "$(ls -A "$SECTOR_DIR"/*.jpeg 2>/dev/null)" ]; then

            # 출력될 동영상 파일 경로
            OUTPUT_FILE="$SECTOR_DIR/output.mp4"
        
            # FFmpeg 명령어로 이미지들을 동영상으로 변환
            nice -n 18 /home/root/ffmpeg/ffmpeg -y -pattern_type glob -i "$SECTOR_DIR/*.jpeg" -c:v libx264 -framerate 2 -r 30 -pix_fmt yuv420p -threads 2 -preset veryfast "$OUTPUT_FILE"

            # 실행 결과 출력
            if [ $? -eq 0 ]; then
                echo "동영상 파일 생성 완료: $OUTPUT_FILE"
            else
                echo "FFmpeg 실행 중 오류가 발생했습니다."
            fi
        fi
     else
        echo "섹터 $sector 폴더가 존재하지 않습니다"
    fi
done
