import React from "react";
import {connect} from "react-redux";
import Container from 'react-bootstrap/Container'
import DragDropColumn from "./DragDropColumn";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {DragDropContext} from "react-beautiful-dnd";
import Actions from "../actions";

class TagEditor extends React.Component {
	constructor(props) {
		super(props);
		const tagsInView = new Set(this.props.tagsInView);
		const availableTags = this.props.allTags.filter(t => !tagsInView.has(t));
		
		// parse nodes to obtain preview
		function getPreview(node) {
			for (let i = 0; i < node.content.length; ++i) {
				const contentNode = node.content[i];
				if (contentNode.type === "text") {
					return contentNode.text;
				} else if (contentNode) {
					const recurseResponse = getPreview(contentNode);
					if (recurseResponse !== "") return recurseResponse;
				}
			}
			return "";
		}
		
		const tags = this.props.tags;
		Object.keys(tags).forEach(tagId => {
			const preview = getPreview(tags[tagId].content);
			const maxPreviewLength = 50;
			tags[tagId]["preview"] = preview.substring(0, maxPreviewLength);
			if (preview.length > maxPreviewLength) {
				tags[tagId]["preview"] += " . . .";
			}
		});
		
		this.state = {
			tags: tags,
			columns: {
				tags_in_view: {
					id: 'tags_in_view',
					title: "Tags in View",
					tagIds: this.props.tagsInView
				},
				tags_available: {
					id: 'tags_available',
					title: "Available Tags",
					tagIds: availableTags
				},
			},
			columnOrder: ['tags_in_view', 'tags_available']
		};
	}
	
	onDragEnd = result => {
		const { destination, source, draggableId } = result;
		if (!destination) return;
		if (destination.droppableId === source.droppableId && destination.index === source.index) return;
		
		let newState = {}
		if (destination.droppableId === source.droppableId) {
			const column = this.state.columns[source.droppableId]
			const newTagIds = Array.from(column.tagIds);
			newTagIds.splice(source.index, 1);
			newTagIds.splice(destination.index, 0, draggableId)
			
			const newColumn = {
				...column,
				tagIds: newTagIds
			}
			
			newState = {
				...this.state,
				columns: {
					...this.state.columns,
					[newColumn.id]: newColumn
				}
			};
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
			
			newState = {
				...this.state,
				columns: {
					...this.state.columns,
					[newStart.id]: newStart,
					[newFinish.id]: newFinish
				}
			};
		}
		this.props.setTagsInView(newState.columns.tags_in_view.tagIds);
		this.setState(newState);
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
								<Col key={column.id} md="12" lg="6">
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
	state => ({ tagInView: state.tagsInView }),
	dispatch => ({
		setTagsInView: tagsInView => dispatch(Actions.setTagsInView(tagsInView)),
	}),
)(TagEditor);
