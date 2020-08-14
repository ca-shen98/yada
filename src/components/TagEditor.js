import React from "react";
import {connect} from "react-redux";
import Container from 'react-bootstrap/Container'
import DragDropColumn from "./DragDropColumn";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {DragDropContext} from "react-beautiful-dnd";

class TagEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tags: {
				'intro_1':   {"id": "intro_1",   "content": "Welcome to the Presentation"},
				'content_1': {"id": "content_1", "content": "Today we will be talking about Yada"},
				'intro_2':   {"id": "intro_2",   "content": "Another Title"},
				'content_2': {"id": "content_2", "content": "More content"},
			},
			columns: {
				'tags_in_view': {
					id: 'tags_in_view',
					title: "Tags in View",
					tagIds: []
				},
				'tags_available': {
					id: 'tags_available',
					title: "Available Tags",
					tagIds: ['intro_1', 'content_1', 'intro_2', 'content_2']
				},
			},
			columnOrder: ['tags_in_view', 'tags_available']
		};
	}
	
	onDragEnd = result => {
		const { destination, source, draggableId } = result;
		if (!destination) return;
		if (destination.droppableId === source.droppableId && destination.index === source.index) return;
		
		if (destination.droppableId === source.droppableId) {
			const column = this.state.columns[source.droppableId]
			const newTagIds = Array.from(column.tagIds);
			newTagIds.splice(source.index, 1);
			newTagIds.splice(destination.index, 0, draggableId)
			
			const newColumn = {
				...column,
				tagIds: newTagIds
			}
			
			const newState = {
				...this.state,
				columns: {
					...this.state.columns,
					[newColumn.id]: newColumn
				}
			};
			
			this.setState(newState);
		} else {
			const start = this.state.columns[source.droppableId];
			const finish = this.state.columns[destination.droppableId];
			const startTagIds = Array.from(start.tagIds);
			startTagIds.splice(source.index, 1);
			const newStart = {
				...start,
				tagIds: startTagIds
			};
			
			const finishTagIds = Array.from(finish.tagIds);
			finishTagIds.splice(destination.index, 0, draggableId);
			const newFinish = {
				...finish,
				tagIds: finishTagIds
			};
			
			const newState = {
				...this.state,
				columns: {
					...this.state.columns,
					[newStart.id]: newStart,
					[newFinish.id]: newFinish
				}
			};
			
			this.setState(newState);
		}
	}
	
	
	render = () => {
		return (
			<DragDropContext onDragEnd={this.onDragEnd}>
				<Container>
					<Row className="justify-content-md-center">
						{this.state.columnOrder.map(columnId => {
							const column = this.state.columns[columnId];
							const tags = column.tagIds.map(tagId => this.state.tags[tagId])
							return (
								<Col md="12" lg="6">
									<DragDropColumn key={column.id} column={column} tags={tags}/>
								</Col>
							);
						})}
					</Row>
				</Container>
			</DragDropContext>
		);
	};
}

export default connect(
	state => ({}),
)(TagEditor);
