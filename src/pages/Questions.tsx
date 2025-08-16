import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameCard, GameCardHeader, GameCardTitle, GameCardContent } from '@/components/ui/game-card'
import { GameButton } from '@/components/ui/game-button'
import { Textarea } from '@/components/ui/textarea'
import { useGameStore } from '@/hooks/useGameStore'
import { ArrowLeft, Send } from 'lucide-react'

const Questions = () => {
  const navigate = useNavigate()
  const { currentRoom, currentPlayer, submitQuestions } = useGameStore()
  
  if (!currentRoom || !currentPlayer) {
    navigate('/')
    return null
  }

  const otherPlayers = currentRoom.players.filter(p => p.id !== currentPlayer.id)
  const [questions, setQuestions] = useState<string[]>(new Array(otherPlayers.length).fill(''))

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[index] = value
    setQuestions(newQuestions)
  }

  const handleSubmit = () => {
    const filledQuestions = questions.filter(q => q.trim())
    if (filledQuestions.length !== otherPlayers.length) {
      return
    }
    
    submitQuestions(questions)
    navigate('/lobby')
  }

  const canSubmit = questions.every(q => q.trim().length > 0)

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <GameButton 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/lobby')}
          >
            <ArrowLeft size={20} />
          </GameButton>
          <div>
            <h1 className="text-xl font-bold text-game-purple">
              Écrivez vos questions
            </h1>
            <p className="text-sm text-muted-foreground">
              {questions.filter(q => q.trim()).length} / {otherPlayers.length} complétées
            </p>
          </div>
        </div>

        {/* Instructions */}
        <GameCard variant="purple">
          <GameCardContent className="text-center">
            <h3 className="font-bold mb-2">📝 Instructions</h3>
            <p className="text-sm opacity-90">
              Écrivez une question personnelle pour chaque joueur. 
              Les questions doivent viser leur prénom réel, pas leur pseudo !
            </p>
          </GameCardContent>
        </GameCard>

        {/* Questions forms */}
        <div className="space-y-4">
          {otherPlayers.map((player, index) => (
            <GameCard key={player.id} variant="beige">
              <GameCardHeader>
                <GameCardTitle className="text-game-purple text-lg">
                  Question pour {player.realName}
                </GameCardTitle>
              </GameCardHeader>
              <GameCardContent>
                <Textarea
                  placeholder={`Ex: Quelle est la plus grosse bêtise que ${player.realName} a faite ?`}
                  value={questions[index]}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  className="min-h-20 resize-none"
                  maxLength={200}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>
                    {questions[index].trim() ? '✅ Complétée' : '⏳ En attente'}
                  </span>
                  <span>
                    {questions[index].length}/200
                  </span>
                </div>
              </GameCardContent>
            </GameCard>
          ))}
        </div>

        {/* Submit button */}
        <div className="space-y-3">
          <GameButton 
            variant="purple" 
            size="full"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2"
          >
            <Send size={18} />
            Envoyer mes questions
          </GameButton>
          
          {!canSubmit && (
            <p className="text-sm text-muted-foreground text-center">
              Veuillez compléter toutes les questions avant d'envoyer
            </p>
          )}
        </div>

        {/* Tips */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>💡 Conseil : Posez des questions qui révèlent des secrets amusants</p>
          <p>🎯 Plus c'est personnel, plus c'est drôle !</p>
        </div>
      </div>
    </div>
  )
}

export default Questions