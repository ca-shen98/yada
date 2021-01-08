import styled from 'styled-components'
import React from "react";
import {connect} from "react-redux";
import {Droppable, Draggable} from "react-beautiful-dnd";

class Tag extends React.Component {
	render = () => {
		const Container = styled.div`
			border: 1px solid lightgrey;
			border-radius: 10px;
			padding: 8px;
			margin-bottom: 8px;
			background-color: ${props => (props.isDragging ? 'lightgreen' : 'white')};
		`;
		const TagId = styled.h5``;
		const Content = styled.div``
		console.log(this.props.tagInfo);
		return (
			<Draggable draggableId={this.props.tagInfo.id.toString()} index={this.props.index}>
				{(provided, snapshot) => (
					<Container
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						isDragging={snapshot.isDragging}
					>
						<TagId>{"this.props.tagInfo.name"}</TagId>
						<Content>{this.props.tagInfo.preview}</Content>
					</Container>
				)}
			</Draggable>
		);
	};
}

class InnerTagList extends React.Component {
	// performance optimization to prevent unnecessary renders
	shouldComponentUpdate(nextProps, nextState, nextContext) {
		return nextProps.tagData !== this.props.tagData;
	}
	
	render() {
		return Object.keys(this.props.tagData).map((tagId, index) => (
			<Tag key={tagId} index={index} tagInfo={this.props.tagData[tagId]}/>
		));
	}
}

class DragDropColumn extends React.Component {
	constructor(props) {
		super(props);
		// used to maintain scroll when rendering updates to tag list
		this.tagListRef = React.createRef();
	}
	
	getSnapshotBeforeUpdate(prevProps, prevState) {
		const list = this.tagListRef.current;
		return list.scrollHeight - list.scrollTop;
	}
	
	componentDidUpdate(prevProps, prevState, snapshot) {
		if (snapshot !== null) {
			const list = this.tagListRef.current;
			list.scrollTop = list.scrollHeight - snapshot;
		}
	}
	
	render = () => {
		const Container = styled.div`
			border: 1px solid lightgrey;
			border-radius: 10px;
			padding: 8px;
			margin-top: 10px;
			margin-bottom: 10px;
			transition: background-color 0.2s ease;
			background-color: ${props => (props.isDraggingOver) ? 'skyblue' : 'white'};
		`;
		const Title = styled.h3`
			padding: 8px;
		`;
		const DroppableRegion = styled.div`
			padding: 8px;
		`;
		const TagList = styled.div`
			overflow-x: hidden;
			overflow-y: auto;
			height: 200px;
			padding-bottom: 30px;
		`;

		return (
			<Droppable droppableId={this.props.column.id}>
				{(provided, snapshot) => {
					return (
						<Container isDraggingOver={snapshot.isDraggingOver}>
							<Title>{this.props.column.title}</Title>
								<DroppableRegion
									ref={provided.innerRef}
									{...provided.droppableProps}
								>
									<TagList ref={this.tagListRef}>
										<InnerTagList tagData={this.props.tagData}/>
										{provided.placeholder}
									</TagList>
								</DroppableRegion>
						</Container>
					);
				}}
			</Droppable>
		);
	};
}

export default connect(
	state => ({}),
)(DragDropColumn);
