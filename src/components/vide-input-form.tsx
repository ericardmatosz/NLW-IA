import { FileVideo, Upload } from 'lucide-react'
import { Button } from "./ui/button";
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import { getFFmpeg } from '../lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { api } from '@/lib/axios';

type Status = 'Waiting' | 'Converting' | 'Uploading' | 'Generating' | 'Sucess'

const statusMessages = {
    Converting: 'Convertendo...',
    Generating: 'Transcrevendo...',
    Uploading: 'Carregando...',
    Sucess: 'Sucesso!'
}

interface VideoInputFormProps {
    onVideoUploaded: (id: string) => void;
}

export function VideoInput(props: VideoInputFormProps) {
    const [ videoFile, setVideoFile ] = useState<File | null>(null)
    const promptInputRef = useRef<HTMLTextAreaElement>(null)
    const [ status, setStatus ] = useState<Status>('Waiting'); 

    async function convertVideoToAudio(video: File) {
        console.log('Convert Started!')

        const ffmpeg = await getFFmpeg()
        await ffmpeg?.writeFile('input.mp4', await fetchFile(video))
        
        ffmpeg?.on('progress', progress => {
            console.log('Convert progress: ' + Math.round(progress.progress * 100))
        })

        await ffmpeg?.exec([
            '-i',
            'input.mp4',
            '-map',
            '0:a',
            '-b:a',
            '20k',
            '-acodec',
            'libmp3lame',
            'output.mp3',
        ])

        const data = await ffmpeg?.readFile('output.mp3')

        if(data) {
            const audioFileBlob = new Blob([data], { type: 'audio/mpeg' })
            const audioFile = new File([audioFileBlob], 'audio.mp3', {
                type: 'audio/mpeg'
            })

            console.log('Convert Finished!')

            return audioFile;
        }
    }

    function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
        const { files } = event.currentTarget;

        if (!files) {
            return;
        }

        const selectedFile = files[0]

        setVideoFile(selectedFile);
    }

    const previewUrl = useMemo(() => {
        if (!videoFile) { 
            return null;
        } 

        return URL.createObjectURL(videoFile);

    }, [videoFile])


    async function handelUploadVideo(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const prompt = promptInputRef.current?.value

        if(!videoFile) {
            return; 
        }

        setStatus('Converting')

        const audioFile = await convertVideoToAudio(videoFile);
        
        const data: any = new FormData();

        data.append('file', audioFile);

        setStatus('Uploading')

        const response = await api.post('/videos', data)

        const videoId = response.data.video.id

        setStatus('Generating')

        await api.post(`/videos/${videoId}/transcription`, {
            prompt
        })

        setStatus('Sucess')

        props.onVideoUploaded(videoId)

        console.log('Finalizou!');
    }


    return (
        <form onSubmit={handelUploadVideo} className='space-y-6'>
            <label 
              htmlFor="video" 
              className='relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5'
            >
              {previewUrl ? (
                    <video src={previewUrl} controls={false} className='pointer-events-none absolute inset-0' />
                ) : (
                    <>
                        <FileVideo className='w-4 h-4' />
                        Selecione um vídeo
                    </>
                )}
            </label>

            <input type="file" id='video' accept='video/mp4' className='sr-only' onChange={handleFileSelected} />

            <Separator />

            <div className='space-y-2'>
              <Label htmlFor='transcription_prompt'>Prompt de transcrição</Label>

              <Textarea
                ref={promptInputRef}
                disabled={status !== 'Waiting'}
                id='transcription_prompt'
                className='h-20 leading-relaxed resize-none'
                placeholder='Inclua palavras-chave mencionadas no vídeo separadas por vírgula (,)'
              />

              <Button 
                data-sucess={status === 'Sucess'}
                disabled={status !== 'Waiting'} 
                type='submit' 
                className='w-full data-[sucess=false]: bg-emerald-900'
            >
                { status === 'Waiting' ? (
                    <>
                        Carregar vídeo
                        <Upload className='w-4 h-4 ml-3' />
                    </>
                ) : statusMessages[status] }
              </Button>
            </div>
          </form>
    )
}