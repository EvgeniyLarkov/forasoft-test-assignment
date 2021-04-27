import { useEffect, useRef, useCallback } from "react";
import freeice from "freeice";
import { Socket } from "socket.io-client";
import {
  EventTypes,
  NewUserEventRequest,
  RelaySdpRequest,
} from "../../server/types";

export const LOCAL_VIDEO = "LOCAL_VIDEO";

export default function useWebRTC(socket: Socket, isCapturing: boolean) {
  const peerConnections = useRef<{ [x: string]: RTCPeerConnection }>({});
  const localMediaStream = useRef<MediaStream | null>(null);
  const peerMediaElements = useRef<{
    [x: string]: HTMLMediaElement | null;
  }>({
    [LOCAL_VIDEO]: null,
  });

  useEffect(() => {
    async function handleNewPeer(user: NewUserEventRequest) {
      const peerID = user.id;
      if (peerID in peerConnections.current) {
        return console.warn(`Already connected to peer ${peerID}`);
      }

      peerConnections.current[peerID] = new RTCPeerConnection({
        iceServers: freeice(),
      });

      peerConnections.current[peerID].onicecandidate = (event) => {
        console.log("ice", event);
        if (event.candidate) {
          socket.emit(EventTypes.RELAY_ICE, {
            peerID,
            iceCandidate: event.candidate,
          });
        }
      };

      peerConnections.current[peerID].ontrack = ({
        streams: [remoteStream],
      }) => {
        if (peerMediaElements.current[peerID]) {
          peerMediaElements.current[peerID]!.srcObject = remoteStream;
        }
      };

      if (localMediaStream.current !== null) {
        localMediaStream.current.getTracks().forEach((track) => {
          peerConnections.current[peerID].addTrack(
            track,
            localMediaStream.current as MediaStream
          );
        });
      }

      if (peerID !== socket.id) {
        const offer = await peerConnections.current[peerID].createOffer();
        console.log("Offer create");
        await peerConnections.current[peerID].setLocalDescription(offer);

        socket.emit(EventTypes.RELAY_SDP, {
          peerID,
          sessionDescription: offer,
        });
      }
    }

    socket.on(EventTypes.NEW_USER, handleNewPeer);

    return () => {
      socket.off(EventTypes.leave);
    };
  }, []);

  useEffect(() => {
    async function setRemoteMedia({
      peerID,
      sessionDescription: remoteDescription,
    }: RelaySdpRequest) {
      console.log(peerConnections.current[peerID]);
      if (!peerConnections.current[peerID].remoteDescription) {
        await peerConnections.current[peerID]?.setRemoteDescription(
          new RTCSessionDescription(remoteDescription)
        );
      }

      console.log("Remote description", remoteDescription, peerConnections.current[peerID]);

      if (remoteDescription.type === "offer") {
        console.log('offer');
        const answer = await peerConnections.current[peerID].createAnswer();

        await peerConnections.current[peerID].setLocalDescription(answer);

        socket.emit(EventTypes.RELAY_SDP, {
          peerID,
          sessionDescription: answer,
        });
      }
    }

    socket.on(EventTypes.SESSION_DESCRIPTION, setRemoteMedia);

    return () => {
      socket.off(EventTypes.SESSION_DESCRIPTION);
    };
  }, []);

  useEffect(() => {
    socket.on(
      EventTypes.ICE_CANDIDATE,
      (props: { peerID: string; iceCandidate: RTCIceCandidate }) => {
        const { peerID, iceCandidate } = props;
        console.log("New ice Candidate", peerConnections.current[peerID]);
        peerConnections.current[peerID]?.addIceCandidate(
          new RTCIceCandidate(iceCandidate)
        );
      }
    );

    return () => {
      socket.off(EventTypes.ICE_CANDIDATE);
    };
  }, []);

  useEffect(() => {
    const handleRemovePeer = (peerID: string) => {
      if (peerConnections.current[peerID]) {
        peerConnections.current[peerID].close();
      }

      delete peerConnections.current[peerID];
      delete peerMediaElements.current[peerID];
    };

    socket.on(EventTypes.leave, handleRemovePeer);

    return () => {
      socket.off(EventTypes.leave);
    };
  }, []);

  // Захват видеопотока у пользователя
  useEffect(() => {
    async function startCapture() {
      const findSources = async () => {
        const sources = await navigator.mediaDevices.enumerateDevices();
        const availableSources = ["videoinput", "audioinput"];
        return availableSources.filter(
          (source) => sources.findIndex((val) => val.kind === source) !== -1
        );
      };

      const hash: { [x: string]: string } = {
        videoinput: "video",
        audioinput: "audio",
      };

      const settings: { [x: string]: any } = {
        audio: true,
        video: {
          width: 1280,
          height: 720,
        },
      };

      const userSources = await findSources();
      const options = userSources.reduce(
        (acc, item) => ({ ...acc, [hash[item]]: settings[hash[item]] }),
        {}
      );
      console.log(options);

      localMediaStream.current = await navigator.mediaDevices.getUserMedia(
        options
      );

      const localVideoElement = peerMediaElements.current[
        LOCAL_VIDEO
      ] as HTMLVideoElement;
      console.log(localVideoElement);
      if (localVideoElement) {
        localVideoElement.volume = 0;
        localVideoElement.srcObject = localMediaStream.current;
      }
      console.log(localMediaStream.current, socket.id);
    }

    const stopTransmission = () => {
      if (localMediaStream.current !== null) {
        localMediaStream.current.getTracks().forEach((track) => track.stop());
      }
      socket.emit(EventTypes.STOP_TRANSMISSION);
    };

    if (isCapturing) {
      startCapture()
        .then(() => socket.emit(EventTypes.START_TRANSMISSION))
        .catch((e) => console.error("Error getting userMedia:", e));
    } else {
      stopTransmission();
    }
  }, [isCapturing]);

  const provideMediaRef = useCallback(
    (id: string, node: HTMLVideoElement | null) => {
      const newId = id === socket.id ? LOCAL_VIDEO : id;
      peerMediaElements.current[newId] = node;
      console.log(peerMediaElements.current, newId, socket.id);
    },
    []
  );

  return [provideMediaRef] as const;
}
