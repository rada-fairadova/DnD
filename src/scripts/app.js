import '../styles/main.css';
import { storage } from './storage.js';
import { DOM } from './dom.js';

class TrelloApp {
    constructor() {
        this.state = this.loadState();
        this.draggedCard = null;
        this.dragStartColumn = null;
        this.init();
    }

    loadState() {
        const savedState = storage.load();
        return savedState || storage.getDefaultData();
    }

    saveState() {
        storage.save(this.state);
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        const container = document.getElementById('columnsContainer');
        container.innerHTML = '';

        this.state.columns.forEach(column => {
            const columnElement = DOM.createColumn(column);
            container.appendChild(columnElement);
        });
    }

    bindEvents() {
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('dragstart', this.handleDragStart.bind(this));
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
        document.addEventListener('dragend', this.handleDragEnd.bind(this));
    }

    handleClick(event) {
        if (event.target.classList.contains('add-card-btn')) {
            this.showAddCardForm(event.target);
        } else if (event.target.classList.contains('add-card-confirm')) {
            this.addCard(event.target);
        } else if (event.target.classList.contains('add-card-cancel')) {
            this.hideAddCardForm(event.target);
        } else if (event.target.classList.contains('card-delete')) {
            this.deleteCard(event.target);
        }
    }

    showAddCardForm(button) {
        const column = button.closest('.column');
        const form = column.querySelector('.add-card-form');
        const textarea = form.querySelector('.add-card-textarea');
        
        button.classList.add('hidden');
        form.classList.remove('hidden');
        textarea.focus();
    }

    hideAddCardForm(button) {
        const form = button.closest('.add-card-form');
        const column = form.closest('.column');
        const addButton = column.querySelector('.add-card-btn');
        const textarea = form.querySelector('.add-card-textarea');
        
        textarea.value = '';
        form.classList.add('hidden');
        addButton.classList.remove('hidden');
    }

    addCard(button) {
        const form = button.closest('.add-card-form');
        const column = form.closest('.column');
        const textarea = form.querySelector('.add-card-textarea');
        const text = textarea.value.trim();

        if (text) {
            const columnId = column.dataset.columnId;
            const columnData = this.state.columns.find(col => col.id === columnId);
            
            const newCard = {
                id: Date.now().toString(),
                text: text
            };

            columnData.cards.push(newCard);
            this.saveState();
            this.render();
        }
    }

    deleteCard(deleteButton) {
        const card = deleteButton.closest('.card');
        const cardId = card.dataset.cardId;
        
        this.state.columns.forEach(column => {
            const cardIndex = column.cards.findIndex(c => c.id === cardId);
            if (cardIndex > -1) {
                column.cards.splice(cardIndex, 1);
            }
        });

        this.saveState();
        this.render();
    }

    handleDragStart(event) {
        if (!event.target.classList.contains('card')) return;

        this.draggedCard = event.target;
        this.dragStartColumn = event.target.closest('[data-column]');
        
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', event.target.dataset.cardId);
        
        setTimeout(() => {
            event.target.classList.add('dragging');
        }, 0);
    }

    handleDragOver(event) {
        event.preventDefault();
        
        const card = event.target.closest('.card');
        const cardsContainer = event.target.closest('.cards-container');
        const placeholder = DOM.createCardPlaceholder();

        if (cardsContainer) {
            const afterElement = this.getDragAfterElement(cardsContainer, event.clientY);
            
            if (afterElement) {
                cardsContainer.insertBefore(placeholder, afterElement);
            } else {
                cardsContainer.appendChild(placeholder);
            }
        }
    }

    handleDrop(event) {
        event.preventDefault();
        
        const cardsContainer = event.target.closest('.cards-container');
        if (!cardsContainer || !this.draggedCard) return;

        const cardId = event.dataTransfer.getData('text/plain');
        const targetColumnId = cardsContainer.dataset.column;
        const placeholder = cardsContainer.querySelector('.card-placeholder');

        if (placeholder) {
            placeholder.remove();
        }

        this.moveCard(cardId, targetColumnId, cardsContainer);
    }

    handleDragEnd(event) {
        if (this.draggedCard) {
            this.draggedCard.classList.remove('dragging');
            this.draggedCard = null;
            
            document.querySelectorAll('.card-placeholder').forEach(placeholder => {
                placeholder.remove();
            });
        }
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    moveCard(cardId, targetColumnId, targetContainer) {
        let cardData = null;
        let sourceColumnId = null;

        this.state.columns.forEach(column => {
            const cardIndex = column.cards.findIndex(c => c.id === cardId);
            if (cardIndex > -1) {
                cardData = column.cards[cardIndex];
                sourceColumnId = column.id;
                column.cards.splice(cardIndex, 1);
            }
        });

        if (cardData) {
            const targetColumn = this.state.columns.find(col => col.id === targetColumnId);
            
            const cards = targetContainer.querySelectorAll('.card:not(.dragging)');
            const placeholderIndex = Array.from(cards).findIndex(card => 
                card.nextElementSibling && 
                card.nextElementSibling.classList.contains('card-placeholder')
            );

            if (placeholderIndex !== -1) {
                targetColumn.cards.splice(placeholderIndex + 1, 0, cardData);
            } else {
                targetColumn.cards.push(cardData);
            }

            this.saveState();
            this.render();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TrelloApp();
});