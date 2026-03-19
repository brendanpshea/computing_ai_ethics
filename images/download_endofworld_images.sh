#!/bin/bash
# Download script for "AI and the End of the World" chapter images
# All images are public domain, CC0, CC-BY, or CC-BY-SA licensed from Wikimedia Commons.
# Run this script from the images/ directory.

cd "$(dirname "$0")"

echo "Downloading images for 'AI and the End of the World' chapter..."

# 1. MQ-9 Reaper Military Drone
# License: Public Domain (U.S. Air Force / U.S. Government work)
# Source: https://commons.wikimedia.org/wiki/File:MQ-9_Reaper_-_090609-F-0000M-777.JPG
echo "Downloading military_drone.jpg (MQ-9 Reaper)..."
wget -q -O military_drone.jpg \
  "https://upload.wikimedia.org/wikipedia/commons/7/76/MQ-9_Reaper_-_090609-F-0000M-777.JPG"

# 2. Ivy King Mushroom Cloud (largest pure-fission nuclear weapon test, 1952)
# License: Public Domain (U.S. Department of Energy, NNSA/NSO Photo Library)
# Source: https://commons.wikimedia.org/wiki/File:Ivy_King_-_mushroom_cloud.jpg
echo "Downloading mushroom_cloud.jpg (Ivy King nuclear test)..."
wget -q -O mushroom_cloud.jpg \
  "https://upload.wikimedia.org/wikipedia/commons/e/e2/Ivy_King_-_mushroom_cloud.jpg"

# 3. Doomsday Clock (90 seconds / 1.5 minutes to midnight)
# License: CC BY-SA 4.0 (by Ryanicus Girraficus)
# Source: https://commons.wikimedia.org/wiki/File:Doomsday_clock_(1.5_minutes).svg
# Note: SVG file - may need conversion for LaTeX. Downloading PNG render instead.
echo "Downloading doomsday_clock.png (90 seconds to midnight)..."
wget -q -O doomsday_clock.png \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Doomsday_clock_%281.5_minutes%29.svg/512px-Doomsday_clock_%281.5_minutes%29.svg.png"

# 3b. Alternative: Doomsday Clock (100 seconds / 1.67 minutes) - CC0 Public Domain
# Source: https://commons.wikimedia.org/wiki/File:Doomsday_clock_(1.67_minutes).svg
echo "Downloading doomsday_clock_100sec.png (100 seconds, CC0)..."
wget -q -O doomsday_clock_100sec.png \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Doomsday_clock_%281.67_minutes%29.svg/512px-Doomsday_clock_%281.67_minutes%29.svg.png"

# 4. Doomsday Clock historical graph
# License: Public Domain (author Fastfission grants unrestricted use)
# Source: https://commons.wikimedia.org/wiki/File:Doomsday_Clock_graph.svg
echo "Downloading doomsday_clock_graph.png..."
wget -q -O doomsday_clock_graph.png \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Doomsday_Clock_graph.svg/800px-Doomsday_Clock_graph.svg.png"

# 5. Biosafety suit (BSL-4 lab)
# License: Public Domain (U.S. Government work, USAMRIID)
# Source: https://commons.wikimedia.org/wiki/File:Positive-pressure_biosafety_suit.jpg
echo "Downloading biosafety_suit.jpg..."
wget -q -O biosafety_suit.jpg \
  "https://upload.wikimedia.org/wikipedia/commons/4/4c/Positive-pressure_biosafety_suit.jpg"

# 6. Nick Bostrom portrait (Stanford 2006)
# License: CC BY-SA 4.0 (verify on file page before use)
# Source: https://commons.wikimedia.org/wiki/File:Nick_Bostrom,_Stanford_2006_(square_crop).jpg
echo "Downloading nick_bostrom.jpg..."
wget -q -O nick_bostrom.jpg \
  "https://upload.wikimedia.org/wikipedia/commons/f/f5/Nick_Bostrom%2C_Stanford_2006_%28square_crop%29.jpg"

# 7. Campaign to Stop Killer Robots
# License: Verify on Wikimedia Commons file page before use
# Source: https://commons.wikimedia.org/wiki/File:Campaign_to_Stop_Killer_Robots.jpg
echo "Downloading killer_robots_campaign.jpg..."
wget -q -O killer_robots_campaign.jpg \
  "https://upload.wikimedia.org/wikipedia/commons/b/b7/Campaign_to_Stop_Killer_Robots.jpg"

# 8. NIAID BSL-4 lab researcher
# License: Public Domain (U.S. Government work, NIAID)
# Source: https://commons.wikimedia.org/wiki/File:NIAID_Integrated_Research_Facility_-_Positive_Pressure_Personnel_Suit.jpg
echo "Downloading bsl4_researcher.jpg..."
wget -q -O bsl4_researcher.jpg \
  "https://upload.wikimedia.org/wikipedia/commons/5/55/NIAID_Integrated_Research_Facility_-_Positive_Pressure_Personnel_Suit.jpg"

echo ""
echo "Downloads complete. Please verify each file downloaded correctly."
echo "Check file sizes with: ls -la *.jpg *.png"
echo ""
echo "IMPORTANT: Before using the Campaign to Stop Killer Robots image,"
echo "verify its license on the Wikimedia Commons file page."
