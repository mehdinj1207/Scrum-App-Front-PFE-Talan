import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../user/User';
import { UserService } from '../user/user.service';

declare var JitsiMeetExternalAPI: any;
@Component({
    selector: 'ngx-meet',
    templateUrl: './meet.component.html',
    styleUrls: ['./meet.component.scss']
})
export class MeetComponent implements OnInit, AfterViewInit {

    domain: string = "8x8.vc"; // For self hosted use your domain
    room: any;
    options: any;
    api: any;
    user: any;
    currentUser:User;
    chatRoomName: string;

    // For Custom Controls
    isAudioMuted = false;
    isVideoMuted = false;
    private routeSub: Subscription;
    room__name: string;
    room__title: string;
    Roles: string[];
    role: string;
    userEmail = window.localStorage.getItem("userEmail");
    name_participant: String;
    constructor(private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private changeDetectorRef: ChangeDetectorRef

    ) { }

    ngOnInit(): void {
        this.getCurrentUser();
        this.route.paramMap.subscribe(params => {
            this.chatRoomName = params.get('chatRoomName');
            console.log('Chat Room Name:', this.chatRoomName);
          });
        this.changeDetectorRef.markForCheck();
        this.room__name = this.chatRoomName;
        this.room__title ="scrumwisetitle";
        this.name_participant= localStorage.getItem('email')
        this.room = this.room__name; // Set your room name
        this.user = {
            name: this.name_participant // Set your username
        }
    }

    ngAfterViewInit(): void {

        this.options = {
            user: {
                name: this.name_participant
            },
            roomName: this.room,
            width: 1300,
            height: 550,
            configOverwrite: {
                prejoinPageEnabled: true
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false, // Masquer le logo Jitsi
                DEFAULT_REMOTE_DISPLAY_NAME: 'Invited', // Définir un nom par défaut pour les participants invités
                TOOLBAR_BUTTONS: [
                    'microphone', // Bouton microphone
                    'camera', // Bouton caméra
                   // 'closedcaptions', // Bouton sous-titres
                    'desktop', // Bouton partage d'écran
                    'fullscreen', // Bouton plein écran
                   // 'fodeviceselection', // Bouton sélection de périphériques
                    'hangup', // Bouton raccrocher
                   // 'profile', // Bouton profil utilisateur
                    'chat', // Bouton chat
                    'recording', // Bouton enregistrement
                    //'livestreaming', // Bouton diffusion en direct
                   // 'etherpad', // Bouton édition collaborative Etherpad
                    //'sharedvideo', // Bouton partage de vidéo
                   // 'settings', // Bouton paramètres
                    'raisehand', // Bouton lever la main
                   // 'videoquality', // Bouton qualité vidéo
                    'filmstrip', // Bouton bandeau vidéo
                    //'invite', // Bouton inviter des participants
                    //'feedback', // Bouton feedback
                    //'stats', // Bouton statistiques
                  //  'shortcuts', // Bouton raccourcis clavier
                    'tileview', // Bouton vue en mosaïque
                  //  'videobackgroundblur', // Bouton flou d'arrière-plan vidéo
                    'download', // Bouton téléchargement
                   // 'help', // Bouton aide
                    'mute-everyone', // Bouton désactiver le son de tous les participants
                   // 'e2ee' // Bouton cryptage de bout en bout
                ], // Définir les boutons de la barre d'outils à afficher
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true, // Désactiver les notifications lorsque des participants rejoignent ou quittent la réunion
                HIDE_INVITE_MORE_HEADER: true, // Masquer l'en-tête "Inviter plus de gens" de la boîte de dialogue d'invitation
            }
            ,
            parentNode: document.querySelector('#jitsi-iframe'),
            userInfo: {
                displayName: this.user.name
            }
        }

        this.api = new JitsiMeetExternalAPI(this.domain, this.options);

        // Event handlers
        this.api.addEventListeners({
            readyToClose: this.handleClose,
            participantLeft: this.handleParticipantLeft,
            participantJoined: this.handleParticipantJoined,
            videoConferenceJoined: this.handleVideoConferenceJoined,
            videoConferenceLeft: this.handleVideoConferenceLeft,
            audioMuteStatusChanged: this.handleMuteStatus,
            videoMuteStatusChanged: this.handleVideoStatus
        });
    }
    handleClose = () => {
        console.log("handleClose");
    }

    handleParticipantLeft = async (participant) => {
        console.log("handleParticipantLeft", participant); // { id: "2baa184e" }
        const data = await this.getParticipants();
    }

    handleParticipantJoined = async (participant) => {
        console.log("handleParticipantJoined", participant); // { id: "2baa184e", displayName: "Shanu Verma", formattedDisplayName: "Shanu Verma" }
        const data = await this.getParticipants();
    }

    handleVideoConferenceJoined = async (participant) => {
        console.log("handleVideoConferenceJoined", participant); // { roomName: "bwb-bfqi-vmh", id: "8c35a951", displayName: "Akash Verma", formattedDisplayName: "Akash Verma (me)"}
        const data = await this.getParticipants();
    }

    handleVideoConferenceLeft = () => {
        console.log("handleVideoConferenceLeft");
        this.router.navigate(['../../calendar'], { relativeTo: this.route });
    }

    handleMuteStatus = (audio) => {
        console.log("handleMuteStatus", audio); // { muted: true }
    }

    handleVideoStatus = (video) => {
        console.log("handleVideoStatus", video); // { muted: true }
    }

    getParticipants() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(this.api.getParticipantsInfo()); // get all participants
            }, 500)
        });
    }
    executeCommand(command: string) {
        this.api.executeCommand(command);;
        if (command == 'hangup') {
            this.router.navigate(['../../calendar'], { relativeTo: this.route });
            return;
        }

        if (command == 'toggleAudio') {
            this.isAudioMuted = !this.isAudioMuted;
        }

        if (command == 'toggleVideo') {
            this.isVideoMuted = !this.isVideoMuted;
        }
    }
    getCurrentUser(){
        this.userService.getUserByEmail().subscribe(
            data=>{
                this.currentUser=data;
                this.changeDetectorRef.markForCheck();

            }
        )
    }


}
