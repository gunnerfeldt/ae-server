# ae-server

Server and remote gui for USB connected AutomanEfforts product - CV96.
Contains full code + Electron engine

The software can be separated in these parts:

#1 - CV96 Server / Automation / Recall / MIDI / Network / Files - hub
  All in / out goes thru this module.
  This also record, store and playback automation / recall data.
  
#2 - Remote96
  Graphic interface displaying timeline / recall states / files and other useful info.
 
#3 - Simulator
  Embedded simulator for testing and developing features. This simulates the CV96 + the VCA faders of an SSL 48 chn console +
  Midi Time Code generator feeding the CV96 MIDI input jack.
  
