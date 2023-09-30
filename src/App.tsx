// Import component from shadcn/ui
import { Button } from "./components/ui/button";
import { Separator } from './components/ui/separator';
import { Textarea } from './components/ui/textarea';
import { Label } from './components/ui/label';
import { Slider } from './components/ui/slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui/select';

// Import icons from lucide-react 
import { Github, Wand2 } from 'lucide-react'
import { VideoInput } from "./components/vide-input-form";
import { PromtpSelect } from "./components/promopt-select";
import { useState } from "react";

import { useCompletion } from 'ai/react'

export function App() {
  const [ temperature, setTemperature ] = useState(0.5)
  const [ videoId, setVideoId ] = useState<string | null>(null)


  function handlePromptSelected(template: string) {
    console.log(template)
  }

  const { 
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading
   } = useCompletion({
    api: 'http://localhost:3333/ai/complete',
    body: {
      videoId,
      temperature
    },
    headers: {
      'Content-type': 'application/json',
    }
  })


  return (
    <div className='min-h-screen flex flex-col'>
      <header className="px-6 py-3 flex items-center justify-between border-b">
        <h1 className="text-xl font-bold">upload.ai</h1>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Desenvolvido com 💜 no NLW da Rocketseat
          </span>

          <Separator orientation='vertical' className='h-6' />

          <Button>
            <Github className='w-4 h-4 mr-2' href="https://github.com/ericardmatosz" />
            Github
          </Button>
        </div>
      </header>

      <main className='flex-1 p-6 flex gap-6'>
        <div className='flex flex-col flex-1 gap-4'>
          <div className='grid grid-rows-2 gap-4 flex-1'>
            <Textarea
              className='resize-none p-4 leading-relaxed'
              placeholder='Inclua o prompt para a IA...' 
              value={input}
              onChange={handleInputChange}
            />

            <Textarea
              className='resize-none p-4 leading-relaxed'
              placeholder='Resultado gerado pela IA' 
              readOnly
              value={completion}
            />
          </div>

          <p className='text-sm text-muted-foreground'>
            Lembre-se: você pode utilizar a variável <code className='text-pink-800'>{'{ transcription } '}</code> 
            no seu prompt para adicionar o conteúdo da transcrição do vídeo selecionado.
          </p>
        </div>

        <aside className='w-80 space-y-6'>
          <VideoInput onVideoUploaded={setVideoId} />

          <Separator />

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor=''>Prompt</Label>

              <PromtpSelect onPromptSelected={setInput} />

              <span className='block text-xs text-muted-foreground italic'>Você poderá customizar essa opção em breve</span>
            </div>

            <div className='space-y-2'>
              <Label htmlFor=''>Modelo</Label>

              <Select defaultValue='gpt3.5' disabled>
                <SelectTrigger>
                  <SelectValue></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='gpt3.5'>GPT 3.5-turbo 16k</SelectItem>
                </SelectContent>
              </Select>

              <span className='block text-xs text-muted-foreground italic'>
                Você poderá customizar essa opção em breve
              </span>
            </div>

            <Separator />

            <div className='space-y-4'>
              <Label htmlFor=''>Temperatura</Label>
              
              <Slider min={0} max={1} step={0.1} value={[temperature]} onValueChange={value => setTemperature(value[0])} />

              <span className='block text-xs text-muted-foreground italic leading-relaxed'>
                Você mais altos tendem a deixar o valor mais criativo e com possíveis erros.
              </span>
            </div>

            <Separator />

            <Button disabled={isLoading} type='submit' className='w-full'>
              Executar
              <Wand2 className='w-4 h-4 ml-2' />
            </Button>
          </form>
        </aside>
      </main>
    </div>
  )
}

