import React, { useState } from 'react'

import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { captureScreen } from 'react-native-view-shot'
import * as FileSystem from 'expo-file-system';

import { feedbackTypes } from '../../utils/feedbackTypes'

import { FeedbackType } from '../Widget'
import { Button } from '../Button'
import { ScreenshotButton } from '../ScreenshotButton'

import { ArrowLeft } from 'phosphor-react-native'
import { theme } from '../../theme'
import { styles } from './styles'

import { api } from '../../libs/api'

interface Props {
  feedbackType: FeedbackType
  onFeedbackCanceled: () => void
  onFeedbackSent: () => void
}

export function Form({feedbackType, onFeedbackCanceled, onFeedbackSent}: Props){
  const [comment, setComment] = useState('')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [isSendingFeedback, setIsSendingFeedback] = useState(false)

  const feedbackTypeInfo = feedbackTypes[feedbackType]

  function handleScreenshot(){
    captureScreen({
      format: 'jpg',
      quality: 0.8,
    })
    .then(uri => setScreenshot(uri))
    .catch(error => console.log(error))
  }

  function handleRemoveScreenshot(){
    setScreenshot(null)
  }

  async function handleSendFeedback() {
    if(isSendingFeedback){
      return
    }
    setIsSendingFeedback(true)
    const screenshotBase64 =  screenshot && await FileSystem.readAsStringAsync(screenshot, {encoding: 'base64'})

    try{
      await api.post('/feedbacks', {
        type: feedbackType,
        comment: comment,
        screenshot: `data:image/png;base64, ${screenshotBase64}`
      })

      onFeedbackSent()

    }catch(error){
      console.log({error})
      setIsSendingFeedback(false)
    }
  }

  return(
    <View style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity onPress={onFeedbackCanceled}> 
        <ArrowLeft size={24} weight='bold' color={theme.colors.text_secondary} />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Image source={feedbackTypeInfo.image} style={styles.image} />
        <Text style={styles.titleText}>
          {feedbackTypeInfo.title}
        </Text>
      </View>
      </View>
      <TextInput
        autoCorrect={false}
        multiline 
        style={styles.input} 
        placeholder="Algo não está funcionando bem? Queremos corrigir. Conte com detalhes o que está acontecendo..."
        placeholderTextColor={theme.colors.text_secondary}
        onChangeText={setComment}
        />
        <View style={styles.footer}>
          <ScreenshotButton 
            screenshot={screenshot} 
            onRemoveShot={handleRemoveScreenshot} 
            onTakeShot={ handleScreenshot} 
          />
          <Button 
            isLoading={isSendingFeedback}
            onPress={handleSendFeedback}
          />
        </View>
    </View>
  )
}