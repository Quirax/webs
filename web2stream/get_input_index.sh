# This script will get the index for the input based on the pid of the process
# that initiated the sound in this case chrome
pid=`ps -ef | grep $1 | grep AudioService | awk {'print $2'}`
pacmd list-sink-inputs | awk -v pid=$pid '/index:/ {idx=$2} /application.process.id/ {gsub(/"/, "", $3); if(int($3) == pid) print idx};'
